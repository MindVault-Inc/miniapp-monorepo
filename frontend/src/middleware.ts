import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // const token = await getToken({ req: request })
  // const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in")

  // if (isAuthPage) {
  //   if (token) {
  //     return NextResponse.redirect(new URL("/", request.url))
  //   }
  //   return NextResponse.next()
  // }

  // if (!token) {
  //   const signInUrl = new URL("/sign-in", request.url)
  //   return NextResponse.redirect(signInUrl)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
} 