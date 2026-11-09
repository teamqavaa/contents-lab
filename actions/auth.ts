'use server';

import { cookies, headers } from 'next/headers';

import { SSO_FRONT_URL, getSsoClient } from '@/lib/sso';

/**
 * Déconnexion globale : purge des cookies locaux puis redirection vers le front SSO, qui vide
 * sa propre session et demande au SSO de révoquer les tokens de TOUTES les applications.
 */
export async function logoutAction(idToken?: string) {
  const cookieStore = await cookies();

  // L'id_token est stocké en cookie httpOnly par le callback : on le relit avant la purge
  const idTokenHint = idToken || cookieStore.get('id_token')?.value;

  for (const cookie of cookieStore.getAll()) {
    cookieStore.delete(cookie.name);
  }

  const logoutUrl = new URL('/api/auth/logout', SSO_FRONT_URL);
  const { appUrl } = getSsoClient(await headers());
  logoutUrl.searchParams.set('post_logout_redirect_uri', `${appUrl}/`);
  if (idTokenHint) {
    logoutUrl.searchParams.set('id_token_hint', idTokenHint);
  }

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
