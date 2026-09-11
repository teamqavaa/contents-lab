"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-zinc-50">
      <AdminSidebar className="hidden md:flex" />

      <div className={cn("flex h-full min-w-0 flex-1 flex-col bg-white")}>
        <AdminTopBar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-zinc-950/50"
            onClick={() => setMenuOpen(false)}
          />
          <AdminSidebar
            className="relative z-10"
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
}