"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  onClose: () => void;
}

// Full-width search overlay so the typed query stays visible. Auto-focus on
// open, Escape or backdrop closes, submit navigates to the catalog.
export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={submitSearch}>
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search courses"
              className="w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400"
            />

            <button
              type="button"
              onClick={onClose}
              className="rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-400 transition-colors hover:text-neutral-600"
            >
              ESC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
