'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import LogoutButton from './LogoutButton';
import { SETTINGS_LINK, isActiveLink, overviewLinks } from './navigation';

/** Navigation du dashboard sur mobile / tablette (la sidebar est masquée). */
export default function MobileNav({ canManage = false }: { canManage?: boolean }) {
  const pathname = usePathname() || '';
  const links = [...overviewLinks(canManage), SETTINGS_LINK];

  return (
    <nav className="lg:hidden flex items-center gap-1 overflow-x-auto pb-1" aria-label="Dashboard">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActiveLink(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium ${
              active ? 'bg-[#6d5deb] text-white' : 'bg-white text-neutral-700 border border-neutral-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
      <LogoutButton className="!py-2 !text-sm whitespace-nowrap" />
    </nav>
  );
}
