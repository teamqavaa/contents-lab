// proxy.ts (App A - Port 3001)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  SECURE_COOKIES,
  SESSION_CHECK_COOKIE,
  SESSION_CHECK_SECONDS,
  SESSION_COOKIES,
  isAccessTokenValid,
} from '@/lib/sso';

// 🟢 Define routes or prefixes that REQUIRE authentication
const PROTECTED_ROUTES = ['/dashboard', '/course/', '/profile', '/settings', '/admin', '/api/protected', '/checkout', '/orders', '/account', '/subscription', '/qavaa', '/carts'];

export default async function proxy(request: NextRequest) {
  // Read the "access_token" cookie set during callback
  let token = request.cookies.get('access_token')?.value;

  // 🔁 Déconnexion globale faite depuis une autre application : le SSO a révoqué le token.
  // Vérification au plus une fois par minute (cookie sso_session_checked).
  let sessionRevoked = false;
  let sessionChecked = false;
  if (token && !request.cookies.has(SESSION_CHECK_COOKIE)) {
    const valid = await isAccessTokenValid(token);
    if (valid === false) {
      sessionRevoked = true;
      token = undefined;
      SESSION_COOKIES.forEach((name) => request.cookies.delete(name));
    } else if (valid) {
      sessionChecked = true;
    }
  }

  // Applique au navigateur le résultat de la vérification de session
  const withSessionCookies = (response: NextResponse) => {
    if (sessionRevoked) {
      SESSION_COOKIES.forEach((name) => response.cookies.delete(name));
    } else if (sessionChecked) {
      response.cookies.set(SESSION_CHECK_COOKIE, '1', {
        httpOnly: true,
        secure: SECURE_COOKIES,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_CHECK_SECONDS,
      });
    }
    return response;
  };

  const userId = request.cookies.get('user_id')?.value;

  const { pathname, searchParams } = request.nextUrl;

  // Check if the current requested page starts with any of the protected route prefixes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // 🔴 CASE 1: Trying to access a PROTECTED route without a token -> Redirect to login
  if (isProtectedRoute && !token) {
    const ssoLoginUrl = new URL('/api/auth/login', request.url);

    // Capture the full path with its query parameters to return to it after logging in
    const fullPathWithQuery = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname;
    ssoLoginUrl.searchParams.set('redirect', fullPathWithQuery);

    return withSessionCookies(NextResponse.redirect(ssoLoginUrl));
  }

  // 🟢 CASE 2: Already logged in and visiting the root "/" or login with a "redirect" parameter
  if ((pathname === '/' || pathname === '/login') && token && searchParams.has('redirect')) {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    return withSessionCookies(NextResponse.redirect(new URL(redirectTo, request.url)));
  }

  // 🟢 CASE 3: Propagate authentication headers for downstream requests/API calls
  const requestHeaders = new Headers(request.headers);

  if (token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }
  if (userId) {
    requestHeaders.set('x-user-id', userId);
  }
  if (sessionRevoked) {
    // Les composants serveur ne doivent plus voir les anciens cookies
    requestHeaders.set('cookie', request.cookies.toString());
  }

  return withSessionCookies(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
