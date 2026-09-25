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
    console.error("🔴 Erreur de State CSRF non valide");
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code || !codeVerifier) {
    console.error("🔴 Code ou code_verifier manquant");
    return NextResponse.json({ error: "Missing code or code_verifier" }, { status: 400 });
  }

  // 1. Récupération dynamique de l'hôte courant pour garantir le type 'string'
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const cleanHost = host.startsWith("0.0.0.0")
    ? host.replace("0.0.0.0", "localhost")
    : host;

  // 2. Variables d'environnement sécurisées avec typage garanti (Non-undefined)
  const REDIRECT_URI: string =
    process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
    process.env.REDIRECT_URI ||
    `${protocol}://${cleanHost}/api/auth/callback`;

  const SSO_API_URL: string =
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app";

  const CLIENT_ID: string =
    process.env.SSO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SSO_CLIENT_ID ||
    "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  try {
    // 3. Échange du code contre les tokens auprès de Django
    const tokenResponse = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI, // ✅ Type string garanti à 100% (Résout l'erreur TS2345)
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("🔴 ERREUR TOKEN OAUTH DJANGO:", JSON.stringify(tokens, null, 2));
      return NextResponse.json({ error: tokens.error_description || "Token exchange failed" }, { status: 400 });
    }

    // 4. Nettoyage des cookies temporaires PKCE
    cookieStore.delete('sso_state');
    cookieStore.delete('sso_code_verifier');

    // 5. Redirection vers le dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (err) {
    console.error("🚨 Erreur réseau lors de l'échange du token:", err);
    return NextResponse.json({ error: "Server error during token exchange" }, { status: 500 });
  }
}
