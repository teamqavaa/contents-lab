"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus on open; Escape closes. Query state resets on remount, since the
  // trigger renders this modal only while it is open.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Overlay sombre avec flou */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenu du Modal */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-4 z-10 animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={submitSearch}>
          <div className="flex items-center gap-3">
            {/* Loupe */}
            <svg className="w-5 h-5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>

            {/* Champ de saisie */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full text-base bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none"
            />

            {/* Bouton Fermer / Esc */}
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-xs font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              ESC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}