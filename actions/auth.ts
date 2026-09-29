'use server';

import { cookies } from 'next/headers';

export async function logoutAction() {
  const cookieStore = await cookies();

  // 1. Récupération des tokens stockés dans les cookies HTTP-Only si présents
  const accessToken = cookieStore.get('app_a_token')?.value;

  const ssoApiUrl = (
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    'https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app'
  ).replace(/\/$/, '');

  const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || process.env.SSO_CLIENT_ID || '';
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://qi-front-app-l2tbnetuqa-ew.a.run.app'
  ).replace(/\/$/, '');

  // 2. Révocation active du token auprès du serveur SSO
  if (accessToken) {
    try {
      await fetch(`${ssoApiUrl}/o/revoke_token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: clientId,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la révocation du jeton côté serveur:', error);
    }
  }

  // 3. Nettoyage des cookies de session côté serveur Next.js
  cookieStore.delete('app_a_token');
  cookieStore.delete('id_token');
  cookieStore.delete('my-app-access-token');
  cookieStore.delete('my-app-refresh-token');

  // 4. Construction de l'URL vers votre API personnalisée /api/o/logout
  const targetRedirect = `${appUrl}/`;
  const logoutUrl = new URL(`${ssoApiUrl}/api/o/logout`);

  // Passage de l'URL de redirection au serveur SSO (paramètres standards 'next' et 'post_logout_redirect_uri')
  logoutUrl.searchParams.set('next', targetRedirect);
  logoutUrl.searchParams.set('post_logout_redirect_uri', targetRedirect);

  if (clientId) {
    logoutUrl.searchParams.set('client_id', clientId);
  }

  return {
    success: true,
    ssoLogoutUrl: logoutUrl.toString(),
  };
}
