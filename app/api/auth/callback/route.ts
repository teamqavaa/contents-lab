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

  try {
    // Échange du code contre les tokens auprès de Django
    const tokenResponse = await fetch("http://localhost:8000/o/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SSO_CLIENT_ID || "UCUWyF4S2sglNWTbrz2Qu07DrEnE1lDZpDPuucPy",
        code: code,
        redirect_uri: "http://localhost:3001/api/auth/callback",
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      // 🚨 C'ICI QU'IL FAUT METTRE LE CONSOLE.ERROR POUR VOIR L'ERREUR EXACTE DE DJANGO
      console.error("🔴 ERREUR TOKEN OAUTH DJANGO:", JSON.stringify(tokens, null, 2));
      return NextResponse.json({ error: tokens.error_description || "Token exchange failed" }, { status: 400 });
    }

    // Si tout est OK, on enregistre les tokens dans l'App A et on redirige vers le dashboard de l'App A
    // ... (votre code existant pour poser les cookies de l'App A)

    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (err) {
    console.error("🚨 Erreur réseau lors de l'échange du token:", err);
    return NextResponse.json({ error: "Server error during token exchange" }, { status: 500 });
  }
}
