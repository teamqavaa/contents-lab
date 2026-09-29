'use server';

import { cookies } from 'next/headers';

export async function logoutAction() {
  const cookieStore = await cookies();

  // 1. Suppression de tous les cookies Next.js serveur
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

  // 🎯 Redirection explicite vers /login
  const targetRedirect = `${appUrl}/login`;

  const logoutUrl = new URL(`${ssoApiUrl}/api/o/logout`);
  logoutUrl.searchParams.set('next', targetRedirect);
  logoutUrl.searchParams.set('post_logout_redirect_uri', targetRedirect);

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
