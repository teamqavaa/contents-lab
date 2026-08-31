// components/mobile/MobileHeaderBar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchTrigger from '@/components/search/SearchTrigger';
import MobileCartButton from './MobuleCartButton';
import LogInButton from '@/components/header/laptop/LogInButton';
import SignUpButton from '@/components/header/laptop/SignUpButton';


export default function MobileHeaderBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* BARRE FIXE - Visible uniquement sur Mobile (md:hidden) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800 md:hidden px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">

          {/* GAUCHE : Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-full">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h7v8l10-12h-7V2z" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-sm text-neutral-900 dark:text-white uppercase">
              Ignite
            </span>
          </Link>

          {/* DROITE : Actions (Recherche + Panier + Hamburger) */}
          <div className="flex items-center gap-2">
            {/* Recherche Popup */}
            <SearchTrigger />

            {/* Panier avec Badge */}
            <MobileCartButton itemCount={3} />

            {/* Bouton Menu Burger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Ouvrir le menu"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* TIROIR DU MENU MOBILE (Déroulant) */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[61px] z-30 bg-white dark:bg-neutral-900 md:hidden p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="fixed inset-0 top-[61px] z-20 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <nav className="flex flex-col gap-4 text-lg font-bold">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-neutral-100 dark:border-neutral-800">
              Home
            </Link>
            <Link href="/courses" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-neutral-100 dark:border-neutral-800">
              Courses
            </Link>
            <Link href="/careers" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-neutral-100 dark:border-neutral-800">
              career path
            </Link>


            <div className="pt-4 flex flex-col gap-3">
              <LogInButton />
              <SignUpButton />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
