'use server';

import { cookies } from 'next/headers';

import { SSO_API_URL } from '@/lib/sso';

export interface ConnectedUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  roles: string[];
  auth_provider: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export async function getConnectedUser(): Promise<ConnectedUser | null> {
  // Hors du try : Next.js lève ici une erreur interne pour rendre la page dynamique
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${SSO_API_URL}/api/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Profil SSO indisponible :', response.status);
      return null;
    }

    return (await response.json()) as ConnectedUser;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil SSO :', error);
    return null;
  }
}
