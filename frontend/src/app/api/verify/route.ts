import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      return NextResponse.json(
        { error: 'Missing request body' },
        { status: 400 }
      );
    }

    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    
    if (!payload || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const app_id = process.env.APP_ID as `app_${string}`;
    if (!app_id) {
      throw new Error('APP_ID environment variable is not set');
    }

    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse;

    if (process.env.NODE_ENV === 'development') {
      console.log('Verification response:', verifyRes);
    }

    if (verifyRes.success) {
      return NextResponse.json(verifyRes, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Verification failed', details: verifyRes },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
