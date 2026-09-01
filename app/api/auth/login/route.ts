// app/api/auth/login/route.ts (App A)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "login";

  // 1. Génération PKCE & State
  const verifier = crypto.randomBytes(32).toString("hex");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  // 2. Sauvegarde des cookies PKCE
  const cookieStore = await cookies();
  cookieStore.set("sso_code_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  cookieStore.set("sso_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  // 3. Configuration des URLs
  const SSO_BASE_URL = process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3000";
  const CLIENT_ID = process.env.SSO_CLIENT_ID || "UCUWyF4S2sglNWTbrz2Qu07DrEnE1lDZpDPuucPy";
  const REDIRECT_URI = "http://localhost:3001/api/auth/callback";

  // 🚨 CORRECTION : On pointe TOUJOURS sur la racine "/" car c'est la seule route publique dans proxy.ts
  const ssoUrl = new URL("/", SSO_BASE_URL);

  ssoUrl.searchParams.set("mode", mode); // On passe le mode en paramètre (login ou register)
  ssoUrl.searchParams.set("client_id", CLIENT_ID);
  ssoUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  ssoUrl.searchParams.set("response_type", "code");
  ssoUrl.searchParams.set("state", state);
  ssoUrl.searchParams.set("code_challenge", challenge);
  ssoUrl.searchParams.set("code_challenge_method", "S256");

  // 4. Redirection explicite HTTP 302
  return NextResponse.redirect(ssoUrl.toString(), { status: 302 });
}
