import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The identity portal that issues the shared auth cookie.
const SSO_PORTAL_URL =
  process.env.SSO_PORTAL_URL ?? "http://localhost:3001";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname, origin } = request.nextUrl;

  const isProtected = pathname.startsWith("/admin");

  if (isProtected && !accessToken) {
    const returnTo = encodeURIComponent(`${origin}${pathname}`);
    return NextResponse.redirect(
      new URL(`/?next=${returnTo}`, SSO_PORTAL_URL)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};