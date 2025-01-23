import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createHash, randomUUID } from "crypto";

// Type for user update data
type UserUpdateData = {
  age: number;
  name: string;
  country: string;
  email: string;
  last_name: string;
  username: string;
  wallet_address: string;
};

// Validation functions
function validateAge(age: number): boolean {
  return age >= 18 && age <= 120;
}

function validateString(str: string, minLength = 2, maxLength = 50): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user profile information
 *     description: Retrieves the current user's profile data including username, subscription status, and verification status
 *     tags:
 *       - User
 *     security:
 *       - NextAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 subscription:
 *                   type: boolean
 *                   example: false
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create user profile
 *     description: Creates a new user profile
 *     tags:
 *       - User
 *     security:
 *       - NextAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *                 minimum: 18
 *                 maximum: 120
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               country:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 format: email
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               username:
 *                 type: string
 *                 pattern: "^[a-zA-Z0-9_-]+$"
 *                 minLength: 3
 *                 maxLength: 30
 *               wallet_address:
 *                 type: string
 *                 pattern: "^0x[a-fA-F0-9]{40}$"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // TODO: modify session to be compliant with the auth used
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const xata = getXataClient();
    const user = await xata.db.Users.filter({ email: userEmail }).getFirst();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: user.username,
      subscription: user.subscription,
      verified: user.verified
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // TODO: modify session to be compliant with the auth used    
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const xata = getXataClient();
    
    // Get current user
    const existingUser = await xata.db.Users.filter({ email: userEmail }).getFirst();
    
    // Parse request body
    const body = await request.json() as UserUpdateData;
    
    // Validate input data
    if (!validateAge(body.age)) {
      return NextResponse.json(
        { error: "Invalid age. Must be between 18 and 120." },
        { status: 400 }
      );
    }
    
    if (!validateString(body.name) || !validateString(body.last_name)) {
      return NextResponse.json(
        { error: "Invalid name or last name. Must be between 2 and 50 characters." },
        { status: 400 }
      );
    }
    
    if (!validateUsername(body.username)) {
      return NextResponse.json(
        { error: "Invalid username. Must be 3-30 characters and contain only letters, numbers, underscores, and hyphens." },
        { status: 400 }
      );
    }
    
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }
    
    if (!validateWalletAddress(body.wallet_address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum wallet address." },
        { status: 400 }
      );
    }
    
    // If this is a new user
    if (!existingUser) {
        // Get the latest user_id
        const latestUser = await xata.db.Users.sort('user_id', 'desc').getFirst();
        const nextUserId = (latestUser?.user_id || 0) + 1;
      
        // TODO: remove this once we have a proper user_uuid generation method
        // TODO: the user_uuid should be easily replicable for the DataLake
        // Generate user_uuid from wallet address if provided
        const userUuid = body.wallet_address 
            ? createHash('sha256').update(body.wallet_address).digest('hex')
        : randomUUID();
      
        // Fetch country rec from the Countries table
        const country = await xata.db.Countries.filter({ country_name: body.country }).getFirst();
        if (!country) {
            return NextResponse.json(
                { error: "Invalid country name provided" },
                { status: 400 }
            );
        }
        const country_record = country?.xata_id;

        // Create new user
        await xata.db.Users.create({
            ...body,
            country: country_record,
            user_id: nextUserId,
            user_uuid: userUuid,
            created_at: new Date(),
            updated_at: new Date(),
            subscription: false,
            verified: false,
            email: userEmail,
        });

    } else {
        return NextResponse.json(
            { error: "User already exists" },
            { status: 400 }
        );
    }
    
    return NextResponse.json(
      { message: "User profile created successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating user:", error);
    
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
} 
