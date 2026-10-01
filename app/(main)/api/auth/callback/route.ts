// app/api/auth/callback/route.ts (dans Contents-Lab)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("sso_code_verifier")?.value;

  const SSO_API_URL = "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app";
  const CLIENT_ID = "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";
  const REDIRECT_URI = "https://qi-front-app-l2tbnetuqa-ew.a.run.app/api/auth/callback";

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${error || "no_code"}`, request.url));
  }

  // 1. Échange du code contre le token OAuth2
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code: code,
    redirect_uri: REDIRECT_URI,
  });

  if (codeVerifier) {
    tokenParams.append("code_verifier", codeVerifier);
  }

  try {
    const res = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("🔴 Erreur /o/token/ :", data);
      return NextResponse.redirect(new URL(`/login?error=token_failed`, request.url));
    }

    // 2. Stockage de l'access_token SUR LE DOMAINE DE CONTENTS-LAB
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in || 3600 * 24,
    });

    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600 * 24 * 30,
      });
    }

    // 3. Nettoyage des cookies de vérification PKCE
    cookieStore.delete("sso_code_verifier");
    cookieStore.delete("sso_state");

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("🚨 Erreur callback :", err);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
