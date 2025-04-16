import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/datesheets") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/courses") ||
      request.nextUrl.pathname.startsWith("/users") ||
      request.nextUrl.pathname.startsWith("/settings")
    ) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (token) {

    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/faculty") && token.role !== "faculty" && token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/datesheets/:path*",
    "/admin/:path*",
    "/courses/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
}
