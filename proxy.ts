import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require an authenticated session. Fine-grained role checks
// (editor/admin) happen in server actions / page guards, since the proxy
// runs on the edge and cannot read the DB.
const PROTECTED_PREFIXES = [
  "/wiki/edit",
  "/wiki/new",
  "/wiki/admin",
  "/wiki/watchlist",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/wiki/edit/:path*",
    "/wiki/new",
    "/wiki/admin/:path*",
    "/wiki/watchlist",
    "/profile/:path*",
  ],
};
