// components/search/SearchTrigger.tsx — bouton loupe du header (raccourci ⌘K / Ctrl+K)
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import SearchModal from './SearchModal';

export default function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search courses"
        title="Search (⌘K)"
        className="btn btn-secondary btn-icon"
      >
        <Search className="h-4 w-4" />
      </button>

      <SearchModal isOpen={isOpen} onClose={close} />
    </>
  );
}
