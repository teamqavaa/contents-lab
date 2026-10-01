// app/api/auth/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  // Récupération exacte des cookies visibles sur votre capture d'écran
  const codeVerifier = cookieStore.get("sso_code_verifier")?.value;

  const SSO_API_URL = "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app";
  const CLIENT_ID = "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";
  const REDIRECT_URI = "https://qi-front-app-l2tbnetuqa-ew.a.run.app/api/auth/callback";

  // Formater les paramètres au format application/x-www-form-urlencoded
  const bodyParams = new URLSearchParams();
  bodyParams.append("grant_type", "authorization_code");
  bodyParams.append("client_id", CLIENT_ID);
  bodyParams.append("code", code || "");
  bodyParams.append("redirect_uri", REDIRECT_URI);

  if (codeVerifier) {
    bodyParams.append("code_verifier", codeVerifier);
  }

  try {
    const res = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: bodyParams.toString(),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error("🔴 Réponse erreur du serveur SSO :", res.status, responseText);
      return NextResponse.redirect(
        new URL(`/login?error=SSO_HTTP_${res.status}`, request.url)
      );
    }

    const data = JSON.parse(responseText);

    // Sauvegarde des tokens
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    // Nettoyage des cookies PKCE temporaires
    cookieStore.delete("sso_code_verifier");
    cookieStore.delete("sso_state");

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("🚨 Erreur réseau :", error);
    return NextResponse.redirect(new URL("/login?error=SSO_FETCH_ERROR", request.url));
  }
}
