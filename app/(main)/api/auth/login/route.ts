// app/api/auth/login/route.ts (App A)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "login";

  // 1. URL de base du SSO avec Fallback obligatoire
  const SSO_BASE_URL =
    process.env.NEXT_PUBLIC_SSO_URL ||
    "https://sso-front-mp3dhl7baq-ew.a.run.app";

  const CLIENT_ID =
    process.env.SSO_CLIENT_ID ||
    "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  // 2. Détection dynamique du protocole et de l'hôte pour le REDIRECT_URI
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  // Utiliser localhost au lieu de 0.0.0.0 si le serveur écoute sur toutes les interfaces
  const cleanHost = host.startsWith("0.0.0.0") ? host.replace("0.0.0.0", "localhost") : host;
  const REDIRECT_URI = `${protocol}://${cleanHost}/api/auth/callback`;

  // 3. Génération PKCE & State
  const verifier = crypto.randomBytes(32).toString("hex");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  // 4. Sauvegarde des cookies PKCE
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

  // 5. Configuration dynamique de l'URL SSO
  const ssoUrl = new URL("/", SSO_BASE_URL);

  ssoUrl.searchParams.set("mode", mode);
  ssoUrl.searchParams.set("client_id", CLIENT_ID);
  ssoUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  ssoUrl.searchParams.set("response_type", "code");
  ssoUrl.searchParams.set("state", state);
  ssoUrl.searchParams.set("code_challenge", challenge);
  ssoUrl.searchParams.set("code_challenge_method", "S256");

  // 6. Redirection explicite HTTP 302 vers le serveur SSO externe
  return NextResponse.redirect(ssoUrl.toString(), { status: 302 });
}
