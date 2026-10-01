// actions/auth.ts
'use server';

import { cookies } from 'next/headers';

export async function logoutAction(idToken?: string) {
  const cookieStore = await cookies();

  // 1. Purge des cookies côté Next.js
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

  // 🎯 Endpoint exact défini dans votre urls.py racine
  const logoutUrl = new URL(`${ssoApiUrl}/api/o/logout/`);
  logoutUrl.searchParams.set('post_logout_redirect_uri', targetRedirect);
  logoutUrl.searchParams.set('next', targetRedirect);

  // 🔑 Ajout de l'id_token_hint si présent pour activer la déconnexion globale OIDC
  if (idToken) {
    logoutUrl.searchParams.set('id_token_hint', idToken);
  }

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
