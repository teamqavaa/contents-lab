'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { SSO_API_URL } from '@/lib/sso';
import { getConnectedUser } from './user';

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  bio: string;
  birth_date: string | null;
  language: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

async function accessToken() {
  return (await cookies()).get('access_token')?.value;
}

/** Transforme une réponse d'erreur DRF ({champ: [msg]}) en {champ: msg}. */
function fieldErrors(data: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(data || {})) {
    errors[field] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  return errors;
}

/** URL absolue de l'avatar (le SSO renvoie un chemin /media/... relatif). */
function absoluteAvatar(avatar: string | null): string | null {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `${SSO_API_URL}${avatar}`;
}

/** Profil SSO de l'utilisateur connecté (GET /api/profile/me/). */
export async function getMyProfile(): Promise<UserProfile | null> {
  const token = await accessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${SSO_API_URL}/api/profile/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const profile = (await res.json()) as UserProfile;
    return { ...profile, avatar: absoluteAvatar(profile.avatar) };
  } catch (error) {
    console.error('Profil SSO indisponible :', error);
    return null;
  }
}

/** Compte : nom et téléphone (PATCH /api/users/<id>/ sur le SSO). */
export async function updateAccountAction(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const [token, user] = [await accessToken(), await getConnectedUser()];
  if (!token || !user) return { ok: false, message: 'Your session has expired, please sign in again.' };

  const phone = String(formData.get('phone') || '').trim();
  const res = await fetch(`${SSO_API_URL}/api/users/${user.id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: String(formData.get('name') || '').trim(), phone: phone || null }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, message: 'Unable to update your account.', errors: fieldErrors(data) };
  }
  revalidatePath('/dashboard', 'layout');
  return { ok: true, message: 'Account updated.' };
}

/** Profil : bio, date de naissance, langue et avatar (PATCH multipart /api/profile/me/). */
export async function updateProfileAction(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const token = await accessToken();
  if (!token) return { ok: false, message: 'Your session has expired, please sign in again.' };

  const body = new FormData();
  body.append('full_name', String(formData.get('full_name') || ''));
  body.append('bio', String(formData.get('bio') || ''));
  body.append('language', String(formData.get('language') || 'en'));
  const birthDate = String(formData.get('birth_date') || '');
  if (birthDate) body.append('birth_date', birthDate);
  const avatar = formData.get('avatar_file');
  if (avatar instanceof File && avatar.size > 0) body.append('avatar_file', avatar);

  const res = await fetch(`${SSO_API_URL}/api/profile/me/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, message: 'Unable to update your profile.', errors: fieldErrors(data) };
  }
  revalidatePath('/dashboard', 'layout');
  return { ok: true, message: 'Profile updated.' };
}

/** Mot de passe (POST /api/users/me/change-password/ : vérifie le mot de passe actuel). */
export async function changePasswordAction(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const token = await accessToken();
  if (!token) return { ok: false, message: 'Your session has expired, please sign in again.' };

  const newPassword = String(formData.get('new_password') || '');
  if (newPassword !== String(formData.get('confirm_password') || '')) {
    return {
      ok: false,
      message: 'Passwords do not match.',
      errors: { confirm_password: 'Passwords do not match.' },
    };
  }

  const res = await fetch(`${SSO_API_URL}/api/users/me/change-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ current_password: String(formData.get('current_password') || ''), new_password: newPassword }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, message: 'Password not changed.', errors: fieldErrors(data) };
  }
  return { ok: true, message: 'Password changed.' };
}
