// lib/manageApi.ts — appels authentifiés à courses-api, côté serveur uniquement.
// Volontairement hors d'un fichier 'use server' : une fonction exportée d'un tel fichier devient une
// server action appelable depuis le navigateur, ce qu'apiCall (chemin libre) ne doit pas être.
import { cookies } from 'next/headers';

import { COURSES_API_URL } from '@/lib/coursesApi';

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value;
}

/** Transforme une réponse d'erreur DRF ({detail} ou {champ: [messages]}) en message lisible. */
export function readErrors(data: unknown): ApiError {
  if (!data || typeof data !== 'object') return { message: 'The request failed, please try again.' };
  const record = data as Record<string, unknown>;
  if (typeof record.detail === 'string') return { message: record.detail };

  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(record)) {
    errors[field] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  const first = Object.entries(errors)[0];
  return { message: first ? `${first[0]}: ${first[1]}` : 'Invalid data.', errors };
}

export async function apiCall(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  const access = await token();
  if (!access) return { ok: false, status: 401, data: { detail: 'Your session has expired, please sign in again.' } };

  const headers: Record<string, string> = { Authorization: `Bearer ${access}` };
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, { ...init, headers, cache: 'no-store' });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error(`courses-api ${path} injoignable :`, error);
    return { ok: false, status: 503, data: { detail: 'The courses service is unreachable.' } };
  }
}

