// components/header/laptop/Header.tsx — en-tête du site (tablette / ordinateur)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import CartButton from "@/components/CartButton";
import IgniteLogo from "@/components/dashboard/IgniteLogo";
import SearchTrigger from "@/components/search/SearchTrigger";
import { useSessionUser } from "@/lib/useSessionUser";
import { LOGIN_URL, REGISTER_URL, SITE_LINKS, isSiteLinkActive } from "../navigation";
import UserMenu from "./UserMenu";

/**
 * Logo Ignite à gauche, onglets dans une pilule au centre, à droite :
 * - visiteur : Log In / Sign Up ;
 * - connecté : panier + menu utilisateur (avatar avec point vert, prénom).
 */
export default function Header() {
  const pathname = usePathname() || "/";
  const { loading, authenticated, user } = useSessionUser();

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] w-[94%] max-w-7xl items-center justify-between gap-4">
        <IgniteLogo />

        <nav aria-label="Main" className="flex items-center gap-1 rounded-[6px] border border-neutral-100 bg-neutral-50 p-1">
          {SITE_LINKS.map((link) => {
            const active = isSiteLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`btn btn-sm font-medium ${
                  active ? "bg-white font-semibold text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-[220px] items-center justify-end gap-2.5">
          <SearchTrigger />
          {loading ? (
            <span className="h-10 w-40 animate-pulse rounded-[var(--radius-btn)] bg-neutral-100" aria-hidden="true" />
          ) : authenticated && user ? (
            <>
              <CartButton />
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <a
                href={LOGIN_URL}
                className="btn btn-secondary"
              >
                Log In
              </a>
              <a
                href={REGISTER_URL}
                className="btn btn-dark"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
