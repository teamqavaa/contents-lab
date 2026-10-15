// lib/sso.ts — configuration unique de la connexion au SSO Qavaa (côté serveur)
// Voir le CLAUDE.md du SSO (§6) pour le détail du flux.

export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://qi-front-app-l2tbnetuqa-ew.a.run.app"
).replace(/\/$/, "");

// Front SSO (page de connexion)
export const SSO_FRONT_URL = (
  process.env.NEXT_PUBLIC_SSO_URL || "https://sso-front-mp3dhl7baq-ew.a.run.app"
).replace(/\/$/, "");

// API du SSO (Django : /o/token/, /api/users/me/, /api/o/logout/)
export const SSO_API_URL = (
  process.env.NEXT_PUBLIC_SSO_API_URL || "https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app"
).replace(/\/$/, "");

export const SSO_CLIENT_ID =
  process.env.SSO_CLIENT_ID ||
  process.env.NEXT_PUBLIC_SSO_CLIENT_ID ||
  "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX";

// Optionnel : uniquement si l'application est "Confidential" dans l'admin du SSO
export const SSO_CLIENT_SECRET = process.env.SSO_CLIENT_SECRET || "";

// Doit être EXACTEMENT une des "Redirect uris" de l'application dans l'admin du SSO
export const SSO_REDIRECT_URI =
  process.env.REDIRECT_URI ||
  process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
  `${APP_URL}/api/auth/callback`;

export const SECURE_COOKIES = process.env.NODE_ENV === "production";

// Cookies temporaires du flux PKCE
export const PKCE_COOKIES = {
  verifier: "sso_code_verifier",
  state: "sso_state",
  redirectAfter: "sso_redirect_after",
} as const;

/** N'accepte que des chemins internes ("/x"), jamais "//domaine" ni une URL absolue. */
export function safeInternalPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  return path;
}

// Cookies de session de l'application (posés par le callback)
export const SESSION_COOKIES = ["access_token", "refresh_token", "id_token", "user_id"] as const;

// Vérification périodique de la session auprès du SSO : détecte une déconnexion globale
// faite depuis une autre application (les tokens sont alors révoqués côté SSO).
export const SESSION_CHECK_COOKIE = "sso_session_checked";
export const SESSION_CHECK_SECONDS = 60;

/** true : token valide, false : révoqué/expiré, null : SSO injoignable (on ne déconnecte pas). */
export async function isAccessTokenValid(accessToken: string): Promise<boolean | null> {
  try {
    const response = await fetch(`${SSO_API_URL}/api/users/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (response.ok) return true;
    if (response.status === 401 || response.status === 403) return false;
    return null;
  } catch {
    return null;
  }
}
