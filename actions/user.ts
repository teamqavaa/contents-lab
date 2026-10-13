'use server';

import { cookies } from 'next/headers';

export interface ConnectedUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  roles: string[];
  auth_provider: string;
  is_active: boolean;
}

export async function getConnectedUser(): Promise<ConnectedUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const userId = cookieStore.get('user_id')?.value; // 👈 Récupéré dynamiquement du cookie

    if (!accessToken || !userId) {
      return null;
    }

    const url = `https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app/api/users/${userId}/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const userData: ConnectedUser = await response.json();
    return userData;

  } catch (error) {
    console.error('Erreur getConnectedUser:', error);
    return null;
  }
}
