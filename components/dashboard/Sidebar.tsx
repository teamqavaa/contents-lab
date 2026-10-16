'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import IgniteLogo from './IgniteLogo';
import LogoutButton from './LogoutButton';
import { OVERVIEW_LINKS, SETTINGS_LINK, isActiveLink } from './navigation';

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof SETTINGS_LINK.icon }) {
  const pathname = usePathname() || '';
  const active = isActiveLink(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
        active ? 'bg-[#ece9fd] text-[#4f3fd6] font-semibold' : 'text-neutral-700 hover:bg-neutral-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}

/** Barre latérale du dashboard (écrans larges). */
export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-neutral-100 px-5 py-7 sticky top-0 h-screen">
      <div className="px-2">
        <IgniteLogo />
      </div>

      <nav className="mt-12 flex flex-col gap-1" aria-label="Overview">
        <p className="px-3 mb-2 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">Overview</p>
        {OVERVIEW_LINKS.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-1" aria-label="Settings">
        <p className="px-3 mb-2 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">Settings</p>
        <NavItem {...SETTINGS_LINK} />
        <LogoutButton />
      </nav>
    </aside>
  );
}
