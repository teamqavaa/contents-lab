"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submitSearch} className="relative">
      <svg
        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 stroke-current stroke-[2]"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What are you looking for?"
        aria-label="Search courses"
        className="h-9 w-56 rounded-full border border-transparent bg-neutral-100 pl-9 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none"
      />
    </form>
  );
}