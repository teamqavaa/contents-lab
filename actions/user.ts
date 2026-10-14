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

    // 1. Vérification du cookie access_token (le user_id n'est plus obligatoire dans l'URL)
    const accessToken = cookieStore.get('access_token')?.value;

    console.log("----------------------------------------");
    console.log("🔍 [DEBUG] access_token présent :", !!accessToken);
    console.log("🔍 [DEBUG] access_token valeur :", accessToken ? accessToken.substring(0, 15) + "..." : "ABSENT");

    if (!accessToken) {
      console.warn("⚠️ [DEBUG] Arrêt : Token manquant dans les cookies.");
      return null;
    }

    // 2. Correction de la route API vers /api/users/me/
    const url = `https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app/api/users/me/`;
    console.log("🚀 [DEBUG] URL de l'appel SSO :", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    console.log("📥 [DEBUG] Statut HTTP reçu du SSO :", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [DEBUG] Corps de l'erreur SSO :", errorText);
      return null;
    }

    const userData: ConnectedUser = await response.json();
    console.log("✅ [DEBUG] Données utilisateur récupérées avec succès :", userData);
    console.log("----------------------------------------");

    return userData;

  } catch (error) {
    console.error('🚨 [DEBUG] Erreur critique attrapée dans getConnectedUser :', error);
    return null;
  }
}
