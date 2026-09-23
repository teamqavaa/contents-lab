// Return destinations allowed after a successful login. All trusted apps share
// the localhost host during development, so any return origin must be one of
// these explicit allowlisted origins to block open-redirect attacks.
export const SSO_RETURN_ORIGIN = process.env.SSO_RETURN_ORIGIN ?? "http://localhost:3001";
// Staff and admin loads land on the SSO portal (qi-sso-front feature-test),
// not on the buyer's admin UA. Identity, roles and profile all live there.
export const SSO_ADMIN_ORIGIN = process.env.SSO_ADMIN_ORIGIN ?? "http://localhost:3001";
// Public marketing homepage (contents-lab public area). Logout lands here rather
// than on the SSO login page so a signed-out user sees the public site, not a
// form. The public area now rides the SSO portal, not the buyer's :3000.
export const SSO_PUBLIC_HOME_ORIGIN = process.env.SSO_PUBLIC_HOME_ORIGIN ?? "http://localhost:3001";
// Identity provider. Login, registration, profile and token refresh all live
// on the SSO service; consumers only verify its RS256 signature.
export const SSO_API_URL = process.env.SSO_API_URL ?? "http://localhost:8001";

const ALLOWED_RETURN_ORIGINS = new Set(
  [SSO_RETURN_ORIGIN, SSO_ADMIN_ORIGIN]
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export function safeReturnPath(next: string | null): string {
  // Students land on their home page when no deep link applies.
  if (!next) return "/home";

  // Same-app navigation stays internal.
  if (next.startsWith("/")) return next;

  try {
    return ALLOWED_RETURN_ORIGINS.has(new URL(next).origin) ? next : "/home";
  } catch {
    return "/home";
  }
}
