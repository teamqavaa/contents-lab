'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, LayoutGrid, Loader2, LogOut, PenSquare, Settings } from 'lucide-react';

import { logoutAction } from '@/actions/auth';
import UserAvatar from '@/components/dashboard/UserAvatar';
import { getFirstName } from '@/lib/initials';
import type { SessionUser } from '@/lib/useSessionUser';
import { ACCOUNT_LINKS, MANAGE_COURSES_LINK } from '../navigation';

const ICONS: Record<string, typeof LayoutGrid> = {
  '/dashboard': LayoutGrid,
  '/dashboard/courses': BookOpen,
  '/dashboard/settings': Settings,
};

/** Déconnexion globale : purge locale puis front SSO (actions/auth.ts → logoutAction). */
export async function signOut() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Stockage indisponible : rien à purger
  }
  window.dispatchEvent(new Event('authChange'));
  try {
    const { ssoLogoutUrl } = await logoutAction();
    window.location.href = ssoLogoutUrl;
  } catch (error) {
    console.error('Erreur lors de la déconnexion SSO :', error);
    window.location.href = '/';
  }
}

/** Avatar (photo ou initiales) avec le point vert « connecté ». */
export function OnlineAvatar({ user, size = 36 }: { user: SessionUser; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0">
      <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size={size} />
      <span
        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
        aria-hidden="true"
      />
    </span>
  );
}

/** Menu de l'utilisateur connecté : nom, Dashboard, My courses, [Manage courses], Settings, Sign out. */
export default function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const links = user.canManageCourses ? [...ACCOUNT_LINKS.slice(0, 2), MANAGE_COURSES_LINK, ACCOUNT_LINKS[2]] : ACCOUNT_LINKS;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="btn btn-secondary gap-2.5 pl-1 pr-3"
      >
        <OnlineAvatar user={user} size={32} />
        <span className="max-w-[120px] truncate text-sm font-semibold text-neutral-900">
          {getFirstName(user.name, user.email)}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-2 pb-3 pt-1">
            <OnlineAvatar user={user} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{user.name || user.email}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
              <p className="text-[11px] font-medium text-emerald-600">Online</p>
            </div>
          </div>

          <div className="flex flex-col py-1.5">
            {links.map((link) => {
              const Icon = ICONS[link.href] ?? PenSquare;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-btn)] px-2.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Icon className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-btn)] border-t border-neutral-100 px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
