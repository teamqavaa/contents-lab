// proxy.ts (App A - Port 3001)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/cart', '/settings', '/checkout', '/qavaa', '/profile', '/orders', '/account', '/payment'];

export default function proxy(request: NextRequest) {
  // On lit le cookie "access_token" que vous posez réellement dans le callback
  const token = request.cookies.get('access_token')?.value;
  const userId = request.cookies.get('user_id')?.value;

  const { pathname, searchParams } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // 🔴 CAS 1 : Tentative d'accès à une route protégée sans token
  if (isProtectedRoute && !token) {
    const ssoLoginUrl = new URL('/api/auth/login', request.url);
    ssoLoginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(ssoLoginUrl);
  }

  // 🟢 CAS 2 : Déjà connecté et sur la racine "/" avec un paramètre "redirect"
  if (pathname === '/' && token && searchParams.has('redirect')) {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // 🟢 CAS 3 : Propagation des en-têtes d'authentification
  const requestHeaders = new Headers(request.headers);

  if (token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }
  if (userId) {
    requestHeaders.set('x-user-id', userId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
