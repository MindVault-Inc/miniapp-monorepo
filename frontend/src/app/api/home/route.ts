import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(JWT_SECRET);

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
      user: {
        name: user.name,
        last_name: user.last_name,
        // TODO: add level and points
        // level: "Coming Soon",
        // points: 45,
        // maxPoints: 100
      }
    });
  } catch (error) {
    console.error('Error in home API route:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 