import { getXataClient } from "@/lib/utils";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash } from "@/lib/crypto";

/**
 * Validation functions for user data
 */
const validateAge = (age: number): boolean => age >= 18 && age <= 120;

const validateString = (str: string, minLength = 2, maxLength = 50): boolean =>
  str.length >= minLength && str.length <= maxLength;

const validateUsername = (username: string): boolean =>
  /^[a-zA-Z0-9_-]{3,30}$/.test(username);

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateWalletAddress = (address: string): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(JWT_SECRET);

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
 */
export async function GET() {
  try {
    const xata = getXataClient();
    let user;

    // Get token from cookies
    const token = cookies().get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.address) {
        user = await xata.db.Users.filter({ 
          wallet_address: payload.address 
        }).getFirst();
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

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

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create user profile
 *     description: Creates a new user profile with provided data
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
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: number
 *                 minimum: 18
 *                 maximum: 120
 *               subscription:
 *                 type: boolean
 *               wallet_address:
 *                 type: string
 *                 pattern: ^0x[a-fA-F0-9]{40}$
 *     responses:
 *       200:
 *         description: User profile created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const xata = getXataClient();
    const data = await req.json();
    
    // Validate all input data
    if (!validateAge(data.age)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid age. Must be between 18 and 120.' }),
        { status: 400 }
      );
    }

    if (!validateString(data.name) || !validateString(data.last_name)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid name or last name. Must be between 2 and 50 characters.' }),
        { status: 400 }
      );
    }

    if (!validateEmail(data.email)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email format.' }),
        { status: 400 }
      );
    }

    if (!validateWalletAddress(data.wallet_address)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid wallet address format.' }),
        { status: 400 }
      );
    }

    // Check if a non-temporary user already exists with this wallet address
    const existingUser = await xata.db.Users.filter({
      'wallet_address': data.wallet_address,
      'name': { $isNot: 'Temporary' }
    }).getFirst();

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'A user with this wallet address already exists',
          isRegistered: true,
          userId: existingUser.user_id,
          userUuid: existingUser.user_uuid
        }),
        { status: 400 }
      );
    }

    // Delete any temporary users with this wallet address
    const tempUsers = await xata.db.Users.filter({
      'wallet_address': data.wallet_address,
      'name': 'Temporary'
    }).getMany();
    
    for (const tempUser of tempUsers) {
      await xata.db.Users.delete(tempUser.xata_id);
    }

    // Generate user_uuid and username
    const userUuid = await createHash(data.wallet_address + Date.now().toString());
    const username = `${data.name.toLowerCase()}_${userUuid.slice(0, 5)}`;

    // Validate username
    if (!validateUsername(username)) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to generate valid username.' }),
        { status: 500 }
      );
    }

    // Get the latest user_id
    const latestUser = await xata.db.Users.sort('user_id', 'desc').getFirst();
    const nextUserId = (latestUser?.user_id || 0) + 1;

    // Get default country
    const countryRecord = await xata.db.Countries.filter({ country_name: "Costa Rica" }).getFirst();
    if (!countryRecord) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to get default country.' }),
        { status: 500 }
      );
    }

    // Create the new user
    const newUser = await xata.db.Users.create({
      user_id: nextUserId,
      user_uuid: userUuid,
      username: username,
      name: data.name,
      last_name: data.last_name,
      email: data.email,
      age: data.age,
      subscription: data.subscription,
      wallet_address: data.wallet_address,
      country: countryRecord.xata_id,
      created_at: new Date(),
      updated_at: new Date(),
      verified: false
    });

    if (!newUser) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500 }
      );
    }

    // Set registration cookie
    const response = new NextResponse(
      JSON.stringify({ 
        message: 'User profile created successfully',
        userId: newUser.user_id,
        userUuid: newUser.user_uuid,
        isRegistered: true
      }),
      { status: 200 }
    );

    response.cookies.set('registration_status', 'complete', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create user profile' }),
      { status: 500 }
    );
  }
} 
