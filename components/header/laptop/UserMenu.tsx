'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Settings, LogOut, Bell, Loader2 } from 'lucide-react';
import CartButton from '@/components/CartButton';
import { logoutAction } from '@/actions/auth';

interface UserData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface UserMenuProps {
  user?: UserData;
}

export default function UserMenu({ user: initialUser }: UserMenuProps) {
  const [userData, setUserData] = useState<UserData | null>(initialUser || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Verrou pour empêcher tout re-fetch pendant la déconnexion
  const isLoggingOutRef = useRef(false);

  const isOnline = userData?.isOnline ?? true;

  const SSO_API_URL = (
    process.env.NEXT_PUBLIC_SSO_API_URL ||
    'https://qavaa-innovate-sso-zlvwvifuvq-ew.a.run.app'
  ).replace(/\/$/, '');

  useEffect(() => {
    if (initialUser) {
      setUserData(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    // Ne rien exécuter si initialUser existe ou si la déconnexion est en cours
    if (initialUser?.name || isLoggingOutRef.current) return;

    const token = localStorage.getItem('app_a_token');
    if (!token) {
      setUserData(null);
      return;
    }

    async function fetchUserProfile() {
      try {
        const res = await fetch(`${SSO_API_URL}/o/userinfo/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Vérifier une deuxième fois que nous ne sommes pas en cours de déconnexion
          if (!isLoggingOutRef.current) {
            setUserData({
              name: data.name || data.first_name || data.username || data.email,
              email: data.email,
              avatarUrl: data.picture || data.avatar_url,
              isOnline: true,
            });
          }
        } else {
          localStorage.removeItem('app_a_token');
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }

    fetchUserProfile();
  }, [initialUser, SSO_API_URL]);

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    // 1. Déposer le verrou IMMÉDIATEMENT
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);

    // 🔑 2. Récupérer l'id_token (localStorage en priorité, puis repli dans les cookies du navigateur)
    let idToken = localStorage.getItem('id_token') || undefined;
    if (!idToken) {
      const match = document.cookie.match(new RegExp('(^| )id_token=([^;]+)'));
      if (match) {
        idToken = match[2];
      }
    }

    // 3. VIDAGE STRICT ET IMMÉDIAT du navigateur (avant toute requête async)
    setUserData(null);
    localStorage.clear();
    sessionStorage.clear();

    // Effacer les cookies accessibles JS
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });

    // Émettre les événements d'actualisation globale
    window.dispatchEvent(new Event('authUpdate'));
    window.dispatchEvent(new Event('authChange'));

    try {
      // 4. Exécuter l'action serveur Next.js en lui passant l'idToken pour la déconnexion globale OIDC
      const { ssoLogoutUrl } = await logoutAction(idToken);

      // 5. Redirection forcée vers l'API SSO avec l'indice de déconnexion
      window.location.href = ssoLogoutUrl;
    } catch (error) {
      console.error('Erreur lors de la déconnexion SSO:', error);
      // En cas d'erreur, forcer la redirection vers l'accueil frontend local
      window.location.href = '/';
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 pr-2">
      <CartButton />

      <button
        type="button"
        className="p-1.5 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-4 h-4" />
      </button>

      <div className="relative group flex items-center">
        <button type="button" className="relative flex items-center justify-center focus:outline-none">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            {userData?.avatarUrl ? (
              <Image
                src={userData.avatarUrl}
                alt={userData.name || 'User Avatar'}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {isOnline && userData && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </button>

        <div className="absolute right-0 top-full pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50 min-w-[180px]">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 px-1 pt-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {userData?.avatarUrl ? (
                    <Image
                      src={userData.avatarUrl}
                      alt={userData.name || 'User Avatar'}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                {isOnline && userData && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {userData?.name || 'User'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {userData ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
                Settings
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                )}
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
