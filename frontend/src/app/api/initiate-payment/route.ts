import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const uuid = crypto.randomUUID().replace(/-/g, "");

  // TODO: Store the ID field in your database so you can verify the payment later
  cookies().set({
    name: "payment-nonce",
    value: uuid,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 3600 // 1 hour expiry
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Payment nonce generated:', uuid);
  }

  return NextResponse.json({ id: uuid });
}
