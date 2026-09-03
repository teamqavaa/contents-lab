import { cookies } from 'next/headers';

const SSO_API_URL = process.env.NEXT_PUBLIC_SSO_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let token: string | undefined;
  let userId: string | undefined;

  // 1. Détection de l'environnement (Serveur / Server Action vs Client / Navigateur)
  if (typeof window === 'undefined') {
    // 🟢 Côté Serveur (Server Actions, React Server Components)
    const cookieStore = await cookies();
    token = cookieStore.get('app_a_token')?.value;
    userId = cookieStore.get('user_id')?.value;
  } else {
    // 🟢 Côté Client (Browser)
    token = localStorage.getItem('app_a_token') || undefined;
    userId = localStorage.getItem('user_id') || undefined;
  }

  // 2. Formatting de l'URL
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${SSO_API_URL}${formattedEndpoint}`;

  // 3. Construction des en-têtes
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-User-Id'] = userId;
  }

  // 4. Exécution de la requête avec options par défaut pour les Server Actions
  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || 'no-store', // Désactive le cache par défaut pour garder les données fraîches
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
