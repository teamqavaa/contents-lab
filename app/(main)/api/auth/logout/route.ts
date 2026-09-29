// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

  // 1. Liste exacte des cookies HttpOnly créés par le callback + PKCE
  const cookiesToClear = [
    'access_token',
    'refresh_token',
    'sso_state',
    'sso_code_verifier',
    'app_a_token',
    'session',
  ];

  // 2. Suppression stricte côte serveur Next.js
  cookiesToClear.forEach((cookieName) => {
    cookieStore.delete({
      name: cookieName,
      path: '/',
    });
  });

  return NextResponse.json({ success: true, message: 'Cookies supprimés' });
}

// Optionnel: supporter aussi la méthode GET si nécessaire
export async function GET() {
  return POST();
}
