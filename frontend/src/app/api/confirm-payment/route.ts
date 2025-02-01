import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/utils";
import { jwtVerify } from "jose";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const secret = new TextEncoder().encode(JWT_SECRET);
const POLLING_ATTEMPTS = 10; // Maximum number of polling attempts
const POLLING_INTERVAL = 2000; // 2 seconds between attempts

async function pollTransaction(transactionId: string, reference: string): Promise<boolean> {
  for (let i = 0; i < POLLING_ATTEMPTS; i++) {
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );
    
    const transaction = await response.json();
    
    if (transaction.reference === reference) {
      if (transaction.status === "mined") {
        return true;
      }
      if (transaction.status === "failed") {
        return false;
      }
    }

    // Wait before next polling attempt
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }

  return false; // Polling timeout
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload;
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

    // Fetch the payment record from database
    const payment = await xata.db.Payments.filter({
      user: user.xata_id,
      uuid: payload.reference
    }).getFirst();

    if (!payment) {
      console.error("Payment record not found for reference:", payload.reference);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the transaction by polling until mined
    const isSuccess = await pollTransaction(payload.transaction_id, payment.uuid);

    if (isSuccess) {
      // Update user's subscription status
      await xata.db.Users.update(user.xata_id, {
        subscription: true,
        subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
