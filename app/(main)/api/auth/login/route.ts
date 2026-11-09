// app/api/auth/login/route.ts — démarre la connexion SSO (Authorization Code + PKCE)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  PKCE_COOKIES,
  SECURE_COOKIES,
  SSO_FRONT_URL,
  getSsoClient,
  safeInternalPath,
} from "@/lib/sso";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "login";

  // 1. Génération PKCE & State
  const verifier = crypto.randomBytes(32).toString("hex");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  // 2. Sauvegarde des cookies temporaires (10 min), relus par le callback
  const cookieStore = await cookies();
  const tmpCookie = {
    httpOnly: true,
    secure: SECURE_COOKIES,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  cookieStore.set(PKCE_COOKIES.verifier, verifier, tmpCookie);
  cookieStore.set(PKCE_COOKIES.state, state, tmpCookie);
  // Page à rouvrir après la connexion (posée par proxy.ts via ?redirect=)
  cookieStore.set(PKCE_COOKIES.redirectAfter, safeInternalPath(searchParams.get("redirect")), tmpCookie);

  // 3. Redirection vers la page de connexion du front SSO ("/" = seule route publique)
  // Le client et la redirect_uri viennent de la configuration du domaine visité (lib/sso.ts) :
  // ils doivent correspondre aux "Redirect uris" déclarées dans le SSO.
  const ssoClient = getSsoClient(request.headers);
  const ssoUrl = new URL("/", SSO_FRONT_URL);
  ssoUrl.searchParams.set("mode", mode);
  ssoUrl.searchParams.set("client_id", ssoClient.clientId);
  ssoUrl.searchParams.set("redirect_uri", ssoClient.redirectUri);
  ssoUrl.searchParams.set("response_type", "code");
  ssoUrl.searchParams.set("state", state);
  ssoUrl.searchParams.set("code_challenge", challenge);
  ssoUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(ssoUrl.toString(), { status: 302 });
}
