// lib/sso.ts — configuration unique de la connexion au SSO Qavaa (côté serveur)
// Voir le CLAUDE.md du SSO (§6) pour le détail du flux.

const APP_URL = (
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

// Application OAuth2 déclarée dans l'admin du SSO pour un domaine du site
export interface SsoClient {
  appUrl: string;
  clientId: string;
  // Optionnel : uniquement si l'application est "Confidential" dans l'admin du SSO
  clientSecret: string;
  // Doit être EXACTEMENT une des "Redirect uris" de l'application dans l'admin du SSO
  redirectUri: string;
}

// Lien de test (Cloud Run) et tout autre domaine
const DEFAULT_SSO_CLIENT: SsoClient = {
  appUrl: APP_URL,
  clientId:
    process.env.SSO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SSO_CLIENT_ID ||
    "o22CDMr2DsKgTAtuB437S90eLvB1KgPUbBeRYsYX",
  clientSecret: process.env.SSO_CLIENT_SECRET || "",
  redirectUri:
    process.env.REDIRECT_URI ||
    process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
    `${APP_URL}/api/auth/callback`,
};

// Phase live. Variables serveur uniquement : jamais de préfixe NEXT_PUBLIC_ pour le secret.
const LIVE_HOST = "learn2ignite.com";
const LIVE_APP_URL = `https://${LIVE_HOST}`;
const LIVE_SSO_CLIENT: SsoClient = {
  appUrl: LIVE_APP_URL,
  clientId: process.env.LIVE_SSO_CLIENT_ID || "",
  clientSecret: process.env.LIVE_SSO_CLIENT_SECRET || "",
  redirectUri: process.env.LIVE_REDIRECT_URI || `${LIVE_APP_URL}/api/auth/callback`,
};

/**
 * Choisit l'application OAuth2 d'après le domaine de la requête. On lit les en-têtes et non
 * request.url : derrière Cloud Run, l'hôte de request.url vaut 0.0.0.0:8080.
 * Seule une égalité exacte avec le domaine live change la configuration.
 */
export function getSsoClient(requestHeaders: Pick<Headers, "get">): SsoClient {
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0];
  const host = (forwardedHost || requestHeaders.get("host") || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
  return host === LIVE_HOST ? LIVE_SSO_CLIENT : DEFAULT_SSO_CLIENT;
}

export const SECURE_COOKIES = process.env.NODE_ENV === "production";

// Cookies temporaires du flux PKCE
export const PKCE_COOKIES = {
  verifier: "sso_code_verifier",
  state: "sso_state",
  redirectAfter: "sso_redirect_after",
} as const;

/** N'accepte que des chemins internes ("/x"), jamais "//domaine" ni une URL absolue. */
export function safeInternalPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path || !path.startsWith("/")) return fallback;
  // Même analyse que le navigateur : "//x", "/\x" ou "/<tabulation>/x" sortiraient du site
  const base = "http://internal.invalid";
  try {
    return new URL(path, base).origin === base ? path : fallback;
  } catch {
    return fallback;
  }
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
