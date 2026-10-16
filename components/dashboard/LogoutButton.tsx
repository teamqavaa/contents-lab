'use client';

import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';

import { logoutAction } from '@/actions/auth';

/** Déconnexion globale : purge locale puis redirection vers le front SSO (voir actions/auth.ts). */
export default function LogoutButton({ className = '' }: { className?: string }) {
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Stockage indisponible : rien à purger
    }
    try {
      const { ssoLogoutUrl } = await logoutAction();
      window.location.href = ssoLogoutUrl;
    } catch (error) {
      console.error('Erreur lors de la déconnexion SSO :', error);
      window.location.href = '/';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-60 ${className}`}
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
      {pending ? 'Signing out…' : 'Logout'}
    </button>
  );
}
