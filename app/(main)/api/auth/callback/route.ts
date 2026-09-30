// app/api/auth/callback/route.ts (App A)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const PROD_BASE_URL = "https://qi-front-app-l2tbnetuqa-ew.a.run.app";

  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";

  const isLocal = rawHost.includes("localhost") || rawHost.includes("127.0.0.1");
  const BASE_URL = isLocal ? `http://${rawHost}` : PROD_BASE_URL;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // 1. Redirection si le SSO renvoie une erreur directe
  if (error) {
    console.error("🔴 Erreur renvoyée par le SSO/Django :", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, BASE_URL));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('sso_state')?.value;
  const codeVerifier = cookieStore.get('sso_code_verifier')?.value;

  // 2. Validation du state CSRF avec redirection propre en cas d'échec
  if (state && savedState && state !== savedState) {
    console.error("🔴 State CSRF invalide | Reçu:", state, "| Attendu:", savedState);
    return NextResponse.redirect(new URL('/login?error=invalid_state', BASE_URL));
  }

  if (!code) {
    console.error("🔴 Code d'autorisation manquant");
    return NextResponse.redirect(new URL('/login?error=missing_code', BASE_URL));
  }

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

  const CLIENT_SECRET: string | undefined = process.env.SSO_CLIENT_SECRET;

  console.log("🚀 ÉCHANGE TOKEN OAUTH DEBUT :", {
    SSO_API_URL,
    CLIENT_ID,
    REDIRECT_URI,
    code_length: code?.length,
    has_verifier: !!codeVerifier,
  });

  try {
    // 3. Préparation des paramètres de requête d'échange
    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
    };

    if (codeVerifier) {
      tokenParams.code_verifier = codeVerifier;
    }

    if (CLIENT_SECRET) {
      tokenParams.client_secret = CLIENT_SECRET;
    }

    // 4. Échange auprès du SSO Django
    const tokenResponse = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("🔴 ERREUR TOKEN OAUTH DJANGO:", JSON.stringify(tokens, null, 2));
      const errorMsg = tokens.error_description || tokens.error || "token_exchange_failed";
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, BASE_URL));
    }

    // 5. Enregistrement des cookies de session finalisés
    if (tokens.access_token) {
      cookieStore.set("access_token", tokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      // Cookie accessible côté client pour vos composants React
      cookieStore.set("app_a_token", tokens.access_token, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // 6. Nettoyage des cookies éphémères
    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    console.log("✅ AUTHENTIFICATION RÉUSSIE -> Redirection vers /dashboard");
    return NextResponse.redirect(new URL('/dashboard', BASE_URL));

  } catch (err) {
    console.error("🚨 Erreur réseau lors de l'échange :", err);
    return NextResponse.redirect(new URL('/login?error=server_error', BASE_URL));
  }
}
