'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Settings, LogOut, ShoppingCart, Bell } from 'lucide-react';

interface UserData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface UserMenuProps {
  user?: UserData;
  cartItemCount?: number;
}

export default function UserMenu({ user: initialUser, cartItemCount = 0 }: UserMenuProps) {
  const [userData, setUserData] = useState<UserData | null>(initialUser || null);
  const isOnline = userData?.isOnline ?? true;

  // 🟢 Utilisation de l'URL API Django (Port 8000)
  const SSO_API_URL = process.env.NEXT_PUBLIC_SSO_API_URL || 'http://localhost:8000';
  const POST_LOGOUT_REDIRECT_URI = 'http://localhost:3001/';

  useEffect(() => {
    if (initialUser?.name) return;

    const token = localStorage.getItem('app_a_token');
    if (!token) return;

    async function fetchUserProfile() {
      try {
        // 🟢 Utilisation de SSO_API_URL pour l'appel d'API
        const res = await fetch(`${SSO_API_URL}/o/userinfo/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name || data.first_name || data.username || data.email,
            email: data.email,
            avatarUrl: data.picture || data.avatar_url,
            isOnline: true,
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }

    fetchUserProfile();
  }, [initialUser, SSO_API_URL]);

  // Logout Handler
  const handleSignOut = () => {
    // 1. Clear local storage tokens
    localStorage.removeItem('app_a_token');
    localStorage.removeItem('sso_code_verifier');
    sessionStorage.removeItem('sso_state');

    // 2. Dispatch events
    window.dispatchEvent(new Event('authUpdate'));
    window.dispatchEvent(new Event('authChange'));

    // 3. Redirection vers l'API Django (Port 8000) pour logout
    const logoutPath = `${SSO_API_URL.replace(/\/$/, '')}/api/o/logout/`;
    const ssoLogoutUrl = new URL(logoutPath);
    ssoLogoutUrl.searchParams.set('post_logout_redirect_uri', POST_LOGOUT_REDIRECT_URI);

    window.location.href = ssoLogoutUrl.toString();
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 pr-2">
      {/* Cart Link */}
      <Link
        href="/cart"
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100"
      >
        <div className="relative flex items-center justify-center">
          <ShoppingCart className="w-4 h-4" />
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white">
            {cartItemCount}
          </span>
        </div>
        <span>Cart</span>
      </Link>

      {/* Notifications Button */}
      <button
        type="button"
        className="p-1.5 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-4 h-4" />
      </button>

      {/* Profile Menu with Hover Flyout */}
      <div className="relative group flex items-center">
        {/* Trigger Avatar */}
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

          {/* Online Indicator */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50 min-w-[180px]">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-2">
            {/* Header: Name + Status */}
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
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {userData?.name || 'User'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Online</span>
              </div>
            </div>

            {/* Links: Settings & Sign Out */}
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
