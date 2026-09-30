// app/api/auth/callback/route.ts
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

    const tokenUrl = `${SSO_API_URL}/o/token/`;
    console.log("📡 Envoi requête échange de token vers:", tokenUrl);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams(tokenParams),
    });

    // 1. Lire d'abord sous forme de texte brut
    const responseText = await tokenResponse.text();

    // 2. Tenter de parser en JSON de manière sécurisée
    let tokens: any = {};
    try {
      tokens = JSON.parse(responseText);
    } catch {
      console.error("🔴 Réponse non-JSON du serveur SSO (Status", tokenResponse.status, "):", responseText.slice(0, 300));
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(`SSO returned HTTP ${tokenResponse.status} non-JSON response`)}`, BASE_URL)
      );
    }

    if (!tokenResponse.ok) {
      console.error("🔴 Erreur échange token Django:", tokens);
      const errorMsg = tokens.error_description || tokens.error || "token_exchange_failed";
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, BASE_URL));
    }

    // 3. Sauvegarde des tokens
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

    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    return NextResponse.redirect(new URL('/dashboard', BASE_URL));

  } catch (err: any) {
    console.error("🚨 Exception échange token:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err?.message || 'server_error')}`, BASE_URL));
  }
}
