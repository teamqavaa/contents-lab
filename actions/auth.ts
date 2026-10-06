'use server';

import { cookies } from 'next/headers';

export async function logoutAction(idToken?: string) {
  const cookieStore = await cookies();

  // 1. Purge de tous les cookies locaux de l'application cliente
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name);
  }

  const ssoApiUrl = (
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    'https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app'
  ).replace(/\/$/, '');

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://qi-front-app-l2tbnetuqa-ew.a.run.app'
  ).replace(/\/$/, '');

  const targetRedirect = `${appUrl}/login`;

  // 🎯 Construction de l'URL de déconnexion vers le SSO
  const logoutUrl = new URL(`${ssoApiUrl}/api/o/logout/`);
  logoutUrl.searchParams.set('post_logout_redirect_uri', targetRedirect);
  logoutUrl.searchParams.set('next', targetRedirect);

  if (idToken) {
    logoutUrl.searchParams.set('id_token_hint', idToken);
  }

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
