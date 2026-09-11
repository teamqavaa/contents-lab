// proxy.ts (App A - Port 3001)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🟢 Define routes or prefixes that REQUIRE authentication
const PROTECTED_ROUTES = ['/dashboard', '/course/', '/profile', '/settings', '/admin', '/api/protected', '/checkout', '/orders', '/account', '/subscription', '/qavaa', '/carts'];

export default function proxy(request: NextRequest) {
  // Read the "access_token" cookie set during callback
  const token = request.cookies.get('access_token')?.value;
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

    return NextResponse.redirect(ssoLoginUrl);
  }

  // 🟢 CASE 2: Already logged in and visiting the root "/" or login with a "redirect" parameter
  if ((pathname === '/' || pathname === '/login') && token && searchParams.has('redirect')) {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // 🟢 CASE 3: Propagate authentication headers for downstream requests/API calls
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
