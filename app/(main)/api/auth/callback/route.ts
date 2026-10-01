// app/api/auth/callback/route.ts (dans le projet Contents-Lab)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const APP_URL = "https://qi-front-app-l2tbnetuqa-ew.a.run.app";
  const SSO_API_URL = "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app";
  const CLIENT_ID = "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

  if (errorParam) {
    return NextResponse.redirect(`${APP_URL}/login?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("sso_code_verifier")?.value;

  // Préparation de l'échange OAuth2
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code: code,
    redirect_uri: `${APP_URL}/api/auth/callback`,
  });

  if (codeVerifier) {
    tokenParams.append("code_verifier", codeVerifier);
  }

  try {
    const tokenRes = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("🔴 Échec de l'échange de token dans Contents-Lab:", tokenData);
      return NextResponse.redirect(`${APP_URL}/login?error=token_exchange_failed`);
    }

    // Création des cookies sur Contents-Lab
    cookieStore.set("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: tokenData.expires_in || 86400,
    });

    if (tokenData.refresh_token) {
      cookieStore.set("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 86400,
      });
    }

    // Nettoyage des cookies de vérification PKCE
    cookieStore.delete("sso_code_verifier");
    cookieStore.delete("sso_state");

    return NextResponse.redirect(`${APP_URL}/dashboard`);
  } catch (err) {
    console.error("🚨 Erreur serveur dans le Callback :", err);
    return NextResponse.redirect(`${APP_URL}/login?error=server_error`);
  }
}
