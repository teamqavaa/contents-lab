'use client';

// lib/useSessionUser.ts — utilisateur connecté côté client (GET /api/auth/me), partagé par le header
// desktop et mobile : une seule requête par chargement, relancée sur l'événement « authChange ».
import { useEffect, useState } from 'react';

export interface SessionUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  canManageCourses: boolean;
}

export interface SessionState {
  loading: boolean;
  authenticated: boolean;
  user: SessionUser | null;
}

let pending: Promise<SessionState> | null = null;

function loadSession(): Promise<SessionState> {
  pending ??= fetch('/api/auth/me', { cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) return { loading: false, authenticated: false, user: null };
      const data = await res.json();
      return { loading: false, authenticated: Boolean(data.authenticated), user: data.user ?? null };
    })
    .catch(() => ({ loading: false, authenticated: false, user: null }));
  return pending;
}

export function useSessionUser(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, authenticated: false, user: null });

  useEffect(() => {
    let active = true;
    const refresh = (force = false) => {
      if (force) pending = null;
      loadSession().then((session) => active && setState(session));
    };
    const onAuthChange = () => refresh(true);

    refresh();
    window.addEventListener('authChange', onAuthChange);
    return () => {
      active = false;
      window.removeEventListener('authChange', onAuthChange);
    };
  }, []);

  return state;
}
