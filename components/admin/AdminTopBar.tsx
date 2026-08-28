"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Bell, ChevronDown, Menu, Search } from "lucide-react";

import { logoutAction } from "@/lib/admin-actions";
import { InitialAvatar } from "./InitialAvatar";

export function AdminTopBar({ onMenu }: { onMenu?: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/admin/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
      {onMenu && (
        <button
          type="button"
          aria-label="Open menu"
          className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-muted hover:text-zinc-900 md:hidden"
          onClick={onMenu}
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>
      )}

      <form onSubmit={submitSearch} className="relative min-w-0 flex-1 sm:max-w-md">
        <Search
          size={14}
          strokeWidth={1.5}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users, courses, instructors..."
          aria-label="Search"
          className="h-9 w-full rounded-full border-0 bg-zinc-100 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-muted hover:text-zinc-900"
        >
          <Bell size={16} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-border py-1 pr-2.5 pl-1">
          <InitialAvatar name="Amina Diallo" className="size-7 text-[10px]" />
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs leading-tight font-medium">Amina Diallo</p>
            <p className="max-w-36 truncate font-mono text-[10px] leading-tight text-muted-foreground">
              amina@qavaa.io
            </p>
          </div>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className="hidden text-zinc-400 sm:block"
          />
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Log out"
            title="Log out"
            className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </header>
  );
}