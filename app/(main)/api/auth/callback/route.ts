// app/api/auth/callback/route.ts (App A)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Résolution stricte de l'URL de base pour éviter le piège 0.0.0.0:8080 de Cloud Run
  const PROD_BASE_URL = "https://qi-front-app-l2tbnetuqa-ew.a.run.app";

  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";

  const isLocal = rawHost.includes("localhost") || rawHost.includes("127.0.0.1");

  // Si on est en prod ou si l'hôte contient 0.0.0.0, on applique l'URL HTTPS Cloud Run
  const BASE_URL = isLocal ? `http://${rawHost}` : PROD_BASE_URL;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Redirection sécurisée en cas d'erreur renvoyée par Django
  if (error) {
    console.error("🔴 Erreur renvoyée par le SSO/Django :", error);
    return NextResponse.redirect(new URL('/login?error=' + error, BASE_URL));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('sso_state')?.value;
  const codeVerifier = cookieStore.get('sso_code_verifier')?.value;

  // Validation du state (sécurité CSRF)
  if (!state || state !== savedState) {
    console.error("🔴 Erreur de State CSRF non valide | Reçu:", state, "| Attendu:", savedState);
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code || !codeVerifier) {
    console.error("🔴 Code ou code_verifier manquant | Code:", !!code, "| Verifier:", !!codeVerifier);
    return NextResponse.json({ error: "Missing code or code_verifier" }, { status: 400 });
  }

  // 2. Variables de configuration garanties
  const REDIRECT_URI: string =
    process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
    process.env.REDIRECT_URI ||
    `${BASE_URL}/api/auth/callback`;

  const SSO_API_URL: string = (
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app"
  ).replace(/\/$/, "");

  const CLIENT_ID: string =
    process.env.SSO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SSO_CLIENT_ID ||
    "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  console.log("🚀 ÉCHANGE TOKEN OAUTH DEBUT :", {
    SSO_API_URL,
    CLIENT_ID,
    REDIRECT_URI,
    code_length: code?.length,
  });

  try {
    // 3. Échange du code contre les tokens auprès de Django
    const tokenResponse = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("🔴 ERREUR TOKEN OAUTH DJANGO:", JSON.stringify(tokens, null, 2));
      return NextResponse.json(
        {
          error: tokens.error_description || "Token exchange failed",
          details: tokens
        },
        { status: 400 }
      );
    }

    // 4. Stockage des tokens (access_token / refresh_token)
    if (tokens.access_token) {
      cookieStore.set("access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 jour
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 jours
      });
    }

    // 5. Nettoyage des cookies temporaires PKCE
    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    console.log("✅ AUTHENTIFICATION SSO RÉUSSIE ! Redirection vers:", `${BASE_URL}/dashboard`);

    // ✅ CORRECTION CLÉ : Utilisation de BASE_URL pour garantir la redirection sur https://qi-front-app-l2tbnetuqa-ew.a.run.app/dashboard
    return NextResponse.redirect(new URL('/dashboard', BASE_URL));

  } catch (err) {
    console.error("🚨 Erreur réseau lors de l'échange du token:", err);
    return NextResponse.json({ error: "Server error during token exchange" }, { status: 500 });
  }
}
