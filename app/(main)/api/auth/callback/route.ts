// app/api/auth/callback/route.ts (App A)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error("🔴 Erreur renvoyée par le SSO/Django :", error);
    return NextResponse.redirect(new URL('/login?error=' + error, request.url));
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

  // 1. Définition prioritaire de l'URL Cloud Run Prod
  const PROD_REDIRECT_URI = "https://qi-front-app-l2tbnetuqa-ew.a.run.app/api/auth/callback";

  // 2. Détection dynamique en secours (Fallback local/dev)
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const cleanHost = host.startsWith("0.0.0.0")
    ? host.replace("0.0.0.0", "localhost")
    : host;

  // 3. Variables garanties en type 'string'
  const REDIRECT_URI: string =
    process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
    process.env.REDIRECT_URI ||
    PROD_REDIRECT_URI ||
    `${protocol}://${cleanHost}/api/auth/callback`;

  const SSO_API_URL: string = (
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app"
  ).replace(/\/$/, "");

  const CLIENT_ID: string =
    process.env.SSO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SSO_CLIENT_ID ||
    "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  // Log de suivi pour vérifier en prod (Cloud Run / Vercel)
  console.log("🚀 ÉCHANGE TOKEN OAUTH DEBUT :", {
    SSO_API_URL,
    CLIENT_ID,
    REDIRECT_URI,
    code_length: code?.length,
  });

  try {
    // 4. Échange du code contre les tokens auprès de Django
    const tokenResponse = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI, // ✅ Exactement https://qi-front-app-l2tbnetuqa-ew.a.run.app/api/auth/callback
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

    // 5. Stockage des tokens (access_token / refresh_token)
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

    // 6. Nettoyage des cookies temporaires PKCE
    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    console.log("✅ AUTHENTIFICATION SSO RÉUSSIE ! Redirection /dashboard");
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (err) {
    console.error("🚨 Erreur réseau lors de l'échange du token:", err);
    return NextResponse.json({ error: "Server error during token exchange" }, { status: 500 });
  }
}
