// components/search/SearchTrigger.tsx
'use client';

import { useState } from 'react';
import SearchModal from './SearchModal';

export default function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton Icône Loupe */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir la recherche"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
      >
        <svg
          className="w-4 h-4 stroke-current stroke-[2]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>

      {/* Le Modal Popup; monté uniquement quand ouvert pour réinitialiser l'état */}
      {isOpen && <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
