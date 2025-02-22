import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from 'next/headers'

// List of public paths that don't require authentication
const PUBLIC_PATHS = [
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
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de']

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

// Update the addLanguagePrefix function to be more precise
function addLanguagePrefix(pathname: string, preferredLanguage: string): string {
  // Don't add prefix if it's an API route
  if (pathname.startsWith('/api/')) {
    return pathname
  }

  // Don't add prefix if it already has a valid language prefix
  for (const lang of SUPPORTED_LANGUAGES) {
    if (pathname.startsWith(`/${lang}/`)) {
      return pathname
    }
  }

  // Add the prefix
  return `/${preferredLanguage}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

// Update the isPublicPath function to handle both prefixed and unprefixed paths
function isPublicPath(path: string): boolean {
  // First check if the path is directly in PUBLIC_PATHS
  if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
    return true
  }

  // Then check if the path without language prefix is in PUBLIC_PATHS
  for (const lang of SUPPORTED_LANGUAGES) {
    if (path.startsWith(`/${lang}/`)) {
      const pathWithoutLang = path.substring(3)
      return PUBLIC_PATHS.some(publicPath => pathWithoutLang.startsWith(publicPath))
    }
  }

  return false
}

// Helper to get language from URL or Accept-Language header
function getLanguageFromPath(pathname: string): string | null {
  const firstSegment = pathname.split('/')[1]
  return SUPPORTED_LANGUAGES.includes(firstSegment) ? firstSegment : null
}

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get language from URL or Accept-Language header
  const urlLanguage = getLanguageFromPath(pathname)
  const acceptLanguage = request.headers.get('Accept-Language')
  const preferredLanguage = urlLanguage || getPrimaryLanguage(acceptLanguage)

  // Create response object that we'll modify
  let response = NextResponse.next()

  // Set Weglot language header
  response.headers.set('Weglot-Language-Preference', preferredLanguage)

  // Skip language prefix redirect for API routes and already prefixed paths
  if (!pathname.startsWith('/api/') && !urlLanguage) {
    const newPathname = addLanguagePrefix(pathname, preferredLanguage)
    
    // Only redirect if the path actually changed
    if (newPathname !== pathname) {
      const url = new URL(newPathname, request.url)
      response = NextResponse.redirect(url)
      response.headers.set('Weglot-Language-Preference', preferredLanguage)
      return response
    }
  }

  // Allow public paths (both with and without language prefix)
  if (isPublicPath(pathname)) {
    return response
  }

  // Rest of your middleware logic...
  const sessionToken = request.cookies.get("session")?.value;
  const registrationStatus = request.cookies.get("registration_status")?.value;

  if (!sessionToken) {
    const signInUrl = new URL(addLanguagePrefix("/sign-in", preferredLanguage), request.url)
    response = NextResponse.redirect(signInUrl)
    response.headers.set('Weglot-Language-Preference', preferredLanguage)
    return response
  }

  try {
    const decoded = await verifyToken(sessionToken)
    if (!decoded) {
      const signInUrl = new URL(addLanguagePrefix("/sign-in", preferredLanguage), request.url)
      response = NextResponse.redirect(signInUrl)
      response.cookies.delete("session")
      response.cookies.delete("registration_status")
      response.headers.set('Weglot-Language-Preference', preferredLanguage)
      return response
    }

    // Handle registration flow
    if (pathname !== "/register" && registrationStatus !== "complete") {
      const registerUrl = new URL(addLanguagePrefix("/register", preferredLanguage), request.url)
      if (decoded.walletAddress) {
        registerUrl.searchParams.set("walletAddress", decoded.walletAddress)
      }
      response = NextResponse.redirect(registerUrl)
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
    const signInUrl = new URL(addLanguagePrefix("/sign-in", preferredLanguage), request.url)
    response = NextResponse.redirect(signInUrl)
    response.cookies.delete("session")
    response.cookies.delete("registration_status")
    response.headers.set('Weglot-Language-Preference', preferredLanguage)
    return response
  }
}

// Update matcher to include language prefixes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/:lang(en|fr|es|de)/:path*"
  ]
};
