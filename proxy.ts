// proxy.ts (App A - Port 3001)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🟢 Routes publiques autorisées sans token (vous pouvez en rajouter si besoin)
const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth'];

export default function proxy(request: NextRequest) {
  // On lit le cookie "access_token" que vous posez réellement dans le callback
  const token = request.cookies.get('access_token')?.value;
  const userId = request.cookies.get('user_id')?.value;

  const { pathname, searchParams } = request.nextUrl;

  // On vérifie si la page actuelle est une route publique
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith('/api/auth'));

  // 🔴 CAS 1 : Tentative d'accès à N'IMPORTE QUELLE page non publique (y compris fausses 404 / pages privées) sans token
  if (!isPublicRoute && !token) {
    const ssoLoginUrl = new URL('/api/auth/login', request.url);

    // On capture le chemin complet avec ses query parameters pour y revenir exactement
    const fullPathWithQuery = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname;
    ssoLoginUrl.searchParams.set('redirect', fullPathWithQuery);

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
