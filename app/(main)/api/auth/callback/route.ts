// app/api/auth/callback/route.ts — retour du SSO : échange du code contre les tokens
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  APP_URL,
  PKCE_COOKIES,
  SECURE_COOKIES,
  SSO_API_URL,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  SSO_REDIRECT_URI,
  safeInternalPath,
} from "@/lib/sso";

function redirectWithError(error: string) {
  return NextResponse.redirect(`${APP_URL}/?error=${encodeURIComponent(error)}`);
}

/** Lit le payload d'un JWT (sans vérification : le token vient directement du SSO en HTTPS). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return redirectWithError(errorParam);
  }
  if (!code) {
    return redirectWithError("missing_code");
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(PKCE_COOKIES.verifier)?.value;
  const expectedState = cookieStore.get(PKCE_COOKIES.state)?.value;
  const redirectAfter = safeInternalPath(cookieStore.get(PKCE_COOKIES.redirectAfter)?.value);

  // Protection CSRF : le state doit être celui généré par /api/auth/login
  if (!expectedState || state !== expectedState) {
    return redirectWithError("invalid_state");
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: SSO_CLIENT_ID,
    code,
    redirect_uri: SSO_REDIRECT_URI,
  });
  if (codeVerifier) {
    tokenParams.append("code_verifier", codeVerifier);
  }
  if (SSO_CLIENT_SECRET) {
    tokenParams.append("client_secret", SSO_CLIENT_SECRET);
  }

  try {
    const tokenRes = await fetch(`${SSO_API_URL}/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams.toString(),
      cache: "no-store",
    });

    const tokenData = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || !tokenData.access_token) {
      const detail = tokenData.error_description || tokenData.error || tokenRes.statusText;
      console.error("Échec de l'échange du code SSO :", tokenRes.status, tokenData);
      return redirectWithError(`SSO_${tokenRes.status}_${detail}`);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: "lax" as const,
      path: "/",
    };
    const maxAge = tokenData.expires_in || 86400;

    cookieStore.set("access_token", tokenData.access_token, { ...cookieOptions, maxAge });

    if (tokenData.refresh_token) {
      cookieStore.set("refresh_token", tokenData.refresh_token, { ...cookieOptions, maxAge: 30 * 86400 });
    }

    if (tokenData.id_token) {
      // Relu par logoutAction pour la déconnexion globale (id_token_hint)
      cookieStore.set("id_token", tokenData.id_token, { ...cookieOptions, maxAge });

      const userId = decodeJwtPayload(tokenData.id_token)?.sub;
      if (typeof userId === "string") {
        cookieStore.set("user_id", userId, { ...cookieOptions, maxAge });
      }
    }

    // Nettoyage des cookies temporaires du flux PKCE
    Object.values(PKCE_COOKIES).forEach((name) => cookieStore.delete(name));

    return NextResponse.redirect(`${APP_URL}${redirectAfter}`);
  } catch (err) {
    console.error("Erreur réseau pendant le callback SSO :", err);
    return redirectWithError("server_error");
  }
}
