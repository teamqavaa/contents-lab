// app/api/auth/callback/route.ts (Contents-Lab)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  const APP_URL = "https://qi-front-app-l2tbnetuqa-ew.a.run.app";
  const SSO_API_URL = "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app";
  const CLIENT_ID = "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";
  const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

  if (errorParam) {
    return NextResponse.redirect(`${APP_URL}/login?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("sso_code_verifier")?.value;

  // Construction des paramètres de demande de token
  const tokenParams = new URLSearchParams();
  tokenParams.append("grant_type", "authorization_code");
  tokenParams.append("client_id", CLIENT_ID);
  tokenParams.append("code", code);
  tokenParams.append("redirect_uri", REDIRECT_URI);

  // Transmission impérative du PKCE si présent
  if (codeVerifier) {
    tokenParams.append("code_verifier", codeVerifier);
  }

  try {
    const tokenRes = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams.toString(),
    });

    const rawText = await tokenRes.text();
    let tokenData: any = {};
    try {
      tokenData = JSON.parse(rawText);
    } catch {
      console.error("🔴 Réponse non-JSON du serveur SSO:", rawText);
    }

    if (!tokenRes.ok) {
      const detailError = tokenData.error_description || tokenData.error || tokenRes.statusText;
      console.error("🔴 ÉCHEC ECHANGE TOKEN DJANGO :", tokenRes.status, tokenData);

      return NextResponse.redirect(
        `${APP_URL}/login?error=${encodeURIComponent(`SSO_${tokenRes.status}_${detailError}`)}`
      );
    }

    // Sauvegarde des tokens de session sur Contents-Lab
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

    // 🟢 EXTRACTION ET STOCKAGE DE L'ID DU USER DEPUIS L'ID TOKEN OIDC
    if (tokenData.id_token) {
      try {
        const base64Url = tokenData.id_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Récupération de l'identifiant (sub ou user_id)
        const userId = payload.sub || payload.user_id;

        if (userId) {
          cookieStore.set("user_id", userId, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 86400,
          });
        }
      } catch (e) {
        console.error("Impossible de décoder l'ID Token pour extraire l'ID:", e);
      }
    }

    // Supprimer les cookies PKCE temporaires
    cookieStore.delete("sso_code_verifier");
    cookieStore.delete("sso_state");

    return NextResponse.redirect(`${APP_URL}/dashboard`);
  } catch (err: any) {
    console.error("🚨 Erreur réseau callback :", err);
    return NextResponse.redirect(`${APP_URL}/login?error=server_error`);
  }
}
