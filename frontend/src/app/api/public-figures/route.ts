import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface UserScores {
  dipl: number;
  econ: number;
  govt: number;
  scty: number;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Calculate the similarity between user scores and celebrity scores
 * Lower score means more similar
 */
function calculateSimilarity(userScores: UserScores, celebrityScores: UserScores): number {
  const diff = {
    dipl: Math.abs(userScores.dipl - celebrityScores.dipl),
    econ: Math.abs(userScores.econ - celebrityScores.econ),
    govt: Math.abs(userScores.govt - celebrityScores.govt),
    scty: Math.abs(userScores.scty - celebrityScores.scty)
  };

  // Return average difference (lower is better)
  return (diff.dipl + diff.econ + diff.govt + diff.scty) / 4;
}

/**
 * @swagger
 * /api/public-figures:
 *   post:
 *     summary: Calculate user's celebrity match based on scores
 *     description: Matches user's scores with closest celebrity and updates PublicFiguresPerUser table
 *     tags:
 *       - Celebrity
 *     security:
 *       - SessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dipl
 *               - econ
 *               - govt
 *               - scty
 *             properties:
 *               dipl:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               econ:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               govt:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               scty:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Successfully matched and saved celebrity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 celebrity:
 *                   type: string
 *                   example: "Elon Musk"
 *                 similarity:
 *                   type: number
 *                   example: 85.5
 *       400:
 *         description: Invalid scores provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
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

    // Get user scores from request body
    const userScores = await request.json() as UserScores;

    // Validate scores
    const scores = [userScores.dipl, userScores.econ, userScores.govt, userScores.scty];
    if (scores.some(score => score < 0 || score > 100 || !Number.isFinite(score))) {
      return NextResponse.json(
        { error: "Invalid scores. All scores must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Get all ideologies
    const celebrities = await xata.db.PublicFigures.getAll();
    
    if (!celebrities.length) {
      return NextResponse.json(
        { error: "No public figures found in database" },
        { status: 404 }
      );
    }

    // Find best matching ideology
    let bestMatch = celebrities[0];
    let bestSimilarity = calculateSimilarity(userScores, celebrities[0].scores as UserScores);

    for (const celebrity of celebrities) {
      const similarity = calculateSimilarity(userScores, celebrity.scores as UserScores);
      if (similarity < bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = celebrity;
      }
    }

    // Get latest celebrity_user_id
    const latestCelebrity = await xata.db.PublicFigurePerUser
      .sort("celebrity_user_id", "desc")
      .getFirst();
    const nextCelebrityId = (latestCelebrity?.celebrity_user_id || 0) + 1;

    // Update or create PublicFigurePerUser record
    await xata.db.PublicFigurePerUser.create({
      user: user.xata_id,
      public_figure: bestMatch.xata_id,
      celebrity_user_id: nextCelebrityId
    });

    return NextResponse.json({
      public_figure: bestMatch.name
    });

  } catch (error) {
    console.error("Error calculating celebrity match:", error);
    return NextResponse.json(
      { error: "Failed to calculate celebrity match" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/public-figures:
 *   get:
 *     summary: Get user's celebrity match
 *     description: Retrieves the user's current celebrity match from their latest test results
 *     tags:
 *       - Celebrity
 *     security:
 *       - SessionCookie: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's celebrity match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 public_figure:
 *                   type: string
 *                   example: "Elon Musk"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or celebrity match not found
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

    // Get user's latest celebrity match from PublicFigurePerUser
    const userCelebrity = await xata.db.PublicFigurePerUser
      .filter({
        "user.xata_id": user.xata_id
      })
      .sort("celebrity_user_id", "desc")
      .select(["celebrity.name"])
      .getFirst();

    if (!userCelebrity || !userCelebrity.celebrity?.name) {
      return NextResponse.json(
        { error: "No celebrity found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      celebrity: userCelebrity.celebrity.name
    });

  } catch (error) {
    console.error("Error fetching celebrity:", error);
    return NextResponse.json(
      { error: "Failed to fetch celebrity" },
      { status: 500 }
    );
  }
}
