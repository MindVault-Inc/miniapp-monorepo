import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from 'next/headers'

// List of public paths that don't require authentication
const publicPaths = [
  "/sign-in",
  "/api/auth/session",
  "/api/user",
  "/api/user/check",
  "/api/nonce",
  "/api/complete-siwe",
  "/_next",
  "/favicon.ico",
  "/register",
  "/MindVaultLogoTransparentHD.svg",
];

// Get the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Create secret for JWT tokens
const secret = new TextEncoder().encode(JWT_SECRET);

interface JWTPayload {
  walletAddress?: string;
  sub?: string;
  exp?: number;
}

// Add supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de'] // Add all languages you support

// Helper to extract primary language from Accept-Language header
function getPrimaryLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en'
  
  // Get first language code (e.g. 'fr-FR,fr;q=0.9,en;q=0.8' -> 'fr')
  const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  
  // Return primary language if supported, otherwise default to 'en'
  return SUPPORTED_LANGUAGES.includes(primaryLang) ? primaryLang : 'en'
}

// Function to verify JWT token
async function verifyToken(token: string) {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const verified = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Validate payload structure
    const payload = verified.payload as JWTPayload;
    if (!payload || typeof payload !== "object") {
      return null;
    }

    // Ensure required fields exist
    if (!payload.walletAddress || !payload.sub) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  const preferredLanguage = getPrimaryLanguage(acceptLanguage)

  // Create response object that we'll modify
  let response = NextResponse.next()

  // Set Weglot language header
  response.headers.set('Weglot-Language-Preference', preferredLanguage)

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return response
  }

  // Get session token and registration status
  const sessionToken = request.cookies.get("session")?.value;
  const registrationStatus = request.cookies.get("registration_status")?.value;

  // For all protected routes
  if (!sessionToken) {
    response = NextResponse.redirect(new URL("/sign-in", request.url))
    response.headers.set('Weglot-Language-Preference', preferredLanguage)
    return response
  }

  try {
    const decoded = await verifyToken(sessionToken)
    if (!decoded) {
      response = NextResponse.redirect(new URL("/sign-in", request.url))
      response.cookies.delete("session")
      response.cookies.delete("registration_status")
      response.headers.set('Weglot-Language-Preference', preferredLanguage)
      return response
    }

    // Handle registration flow
    if (pathname !== "/register" && registrationStatus !== "complete") {
      const url = new URL("/register", request.url)
      if (decoded.walletAddress) {
        url.searchParams.set("walletAddress", decoded.walletAddress)
      }
      response = NextResponse.redirect(url)
      response.headers.set('Weglot-Language-Preference', preferredLanguage)
      return response
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.sub as string)
      requestHeaders.set("x-wallet-address", decoded.walletAddress as string)
      requestHeaders.set("x-preferred-language", preferredLanguage)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return response

  } catch {
    // Clear invalid session
    response = NextResponse.redirect(new URL("/sign-in", request.url))
    response.cookies.delete("session")
    response.cookies.delete("registration_status")
    response.headers.set('Weglot-Language-Preference', preferredLanguage)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
