import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

const EMPLOYER_ONLY_PREFIXES = ["/employer"];
const AUTH_REQUIRED_PREFIXES = ["/jobs", "/my-applications"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth =
    AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    EMPLOYER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (!requiresAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Employer-only routes
  if (
    EMPLOYER_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) &&
    payload.role !== "employer"
  ) {
    return NextResponse.redirect(new URL("/jobs", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/jobs/:path*", "/employer/:path*", "/my-applications"],
};
