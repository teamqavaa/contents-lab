'use server';

import { cookies } from 'next/headers';

import { APP_URL, SSO_API_URL } from '@/lib/sso';

export async function logoutAction(idToken?: string) {
  const cookieStore = await cookies();

  // L'id_token est stocké en cookie httpOnly par le callback : on le relit avant la purge
  const idTokenHint = idToken || cookieStore.get('id_token')?.value;

  // 1. Purge de tous les cookies locaux de l'application cliente
  for (const cookie of cookieStore.getAll()) {
    cookieStore.delete(cookie.name);
  }

  // 2. Déconnexion globale sur le SSO (révocation de tous les tokens), puis retour à l'accueil
  const targetRedirect = `${APP_URL}/`;
  const logoutUrl = new URL(`${SSO_API_URL}/api/o/logout/`);
  logoutUrl.searchParams.set('post_logout_redirect_uri', targetRedirect);

  if (idTokenHint) {
    logoutUrl.searchParams.set('id_token_hint', idTokenHint);
  }

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
