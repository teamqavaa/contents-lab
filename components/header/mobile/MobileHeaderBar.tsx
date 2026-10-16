// components/header/mobile/MobileHeaderBar.tsx — en-tête du site sur mobile
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, LogOut, Menu, X } from 'lucide-react';

import CartButton from '@/components/CartButton';
import IgniteLogo from '@/components/dashboard/IgniteLogo';
import SearchTrigger from '@/components/search/SearchTrigger';
import { useSessionUser } from '@/lib/useSessionUser';
import { OnlineAvatar, signOut } from '../laptop/UserMenu';
import {
  ACCOUNT_LINKS,
  LOGIN_URL,
  MANAGE_COURSES_LINK,
  REGISTER_URL,
  SITE_LINKS,
  isSiteLinkActive,
} from '../navigation';

export default function MobileHeaderBar() {
  const pathname = usePathname() || '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { authenticated, user } = useSessionUser();
  const close = () => setIsMenuOpen(false);
  const accountLinks = user?.canManageCourses ? [...ACCOUNT_LINKS, MANAGE_COURSES_LINK] : ACCOUNT_LINKS;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-neutral-200/60 bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <IgniteLogo />
          <div className="flex items-center gap-2">
            <SearchTrigger />
            {authenticated && user && <CartButton />}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-800"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-30 overflow-y-auto bg-white p-6 md:hidden">
          {authenticated && user && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
              <OnlineAvatar user={user} size={44} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">{user.name || user.email}</p>
                <p className="text-xs font-medium text-emerald-600">Online</p>
              </div>
            </div>
          )}

          <nav aria-label="Main" className="flex flex-col text-lg font-bold">
            {SITE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                aria-current={isSiteLinkActive(pathname, link.href) ? 'page' : undefined}
                className="border-b border-neutral-100 py-3 aria-[current=page]:text-[#4f3fd6]"
              >
                {link.label}
              </Link>
            ))}
            {authenticated &&
              accountLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={close} className="border-b border-neutral-100 py-3">
                  {link.label}
                </Link>
              ))}
          </nav>

          <div className="mt-6 flex flex-col gap-3">
            {authenticated ? (
              <button
                type="button"
                disabled={signingOut}
                onClick={() => {
                  setSigningOut(true);
                  signOut();
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-sm font-bold text-red-600"
              >
                {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Sign out
              </button>
            ) : (
              <>
                <a href={LOGIN_URL} className="rounded-full border border-neutral-200 py-3 text-center text-sm font-bold">
                  Log In
                </a>
                <a href={REGISTER_URL} className="rounded-full bg-neutral-900 py-3 text-center text-sm font-bold text-white">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
