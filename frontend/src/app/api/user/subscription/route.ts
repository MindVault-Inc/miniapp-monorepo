import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getXataClient } from "@/lib/utils";

/**
 * @swagger
 * /api/user/subscription:
 *   get:
 *     summary: Get user's subscription expiration date
 *     description: Retrieves the user's subscription expiration date in a human-readable format
 *     responses:
 *       200:
 *         description: Successfully retrieved subscription date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 next_payment_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-03-25"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or no subscription
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  try {
    // TODO: Remove this once we have a proper auth system
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const xata = getXataClient();

    // Get user's subscription info
    const user = await xata.db.Users
      .filter({ email: userEmail })
      .select(["subscription_expires"])
      .getFirst();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.subscription_expires) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Format the date to YYYY-MM-DD
    const nextPaymentDate = user.subscription_expires.toISOString().split('T')[0];

    return NextResponse.json({
      next_payment_date: nextPaymentDate
    });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 