"use client";

import { useState } from "react";
import SearchModal from "./SearchModal";

// Icon button that opens the full-width search overlay. The modal mounts only
// while open so its query state resets on every close.
export default function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
        className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>

      {isOpen && <SearchModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
