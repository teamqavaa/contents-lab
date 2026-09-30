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
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, BASE_URL));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', BASE_URL));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('sso_code_verifier')?.value;

  const REDIRECT_URI = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI || `${BASE_URL}/api/auth/callback`;
  const SSO_API_URL = (process.env.NEXT_PUBLIC_SSO_API_URL || "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app").replace(/\/$/, "");
  const CLIENT_ID = process.env.SSO_CLIENT_ID || process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  try {
    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
    };

    if (codeVerifier) {
      tokenParams.code_verifier = codeVerifier;
    }

    if (process.env.SSO_CLIENT_SECRET) {
      tokenParams.client_secret = process.env.SSO_CLIENT_SECRET;
    }

    const tokenResponse = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("🔴 Erreur échange token Django:", tokens);
      const errorMsg = tokens.error_description || tokens.error || "token_exchange_failed";
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, BASE_URL));
    }

    // Stockage des cookies
    if (tokens.access_token) {
      cookieStore.set("access_token", tokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      cookieStore.set("app_a_token", tokens.access_token, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    // Nettoyage des verifiers
    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    return NextResponse.redirect(new URL('/dashboard', BASE_URL));

  } catch (err: any) {
    console.error("🚨 Exception échange token:", err);
    // Affichage explicite de l'erreur dans l'URL pour un diagnostic facile
    const errorMsg = encodeURIComponent(err?.message || "server_error");
    return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, BASE_URL));
  }
}
