// Adopts the SSO access token issued by qi-sso-front into this app's own
// httpOnly cookie, then returns to the page the user came from.
//
// The identity portal owns the session cookie on its own origin. Browsers
// keep cookies per-origin, so the portal carries the token here in the URL
// for one hop. Contents Lab writes it into its own cookie jar so the admin
// gate (proxy.ts + requireAdmin) can read it without another exchange.
import { NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes, matches the backend lifetime

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const next = searchParams.get("next") ?? "/";

  // Avoid storing the token when the portal sent none; the admin gate will
  // send the user back to the portal to sign in.
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Only allow internal destinations so a crafted link cannot bounce the
  // browser to an arbitrary site.
  let destination: URL;
  try {
    destination = new URL(next, request.url);
  } catch {
    destination = new URL("/", request.url);
  }
  if (destination.origin !== new URL(request.url).origin) {
    destination = new URL("/", request.url);
  }

  const response = NextResponse.redirect(new URL(destination.pathname + destination.search, request.url));
  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  return response;
}
