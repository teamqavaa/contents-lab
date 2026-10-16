import { Bell, Search } from 'lucide-react';

import IgniteLogo from './IgniteLogo';
import MobileNav from './MobileNav';
import UserAvatar from './UserAvatar';

interface TopbarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  canManage?: boolean;
}

/** En-tête du dashboard : recherche dans mes cours, notifications, utilisateur connecté. */
export default function Topbar({ name, email, avatarUrl, canManage = false }: TopbarProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="lg:hidden">
        <IgniteLogo />
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <form action="/dashboard/courses" method="get" role="search" className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
          <input
            type="search"
            name="q"
            placeholder="Search your course...."
            aria-label="Search your courses"
            className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#6d5deb] focus:ring-2 focus:ring-[#6d5deb]/15"
          />
        </form>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden sm:flex w-11 h-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
        >
          <Bell className="w-4 h-4" />
        </button>

        <span className="hidden md:block h-10 w-px bg-neutral-200" aria-hidden="true" />

        <div className="flex items-center gap-3 shrink-0">
          <UserAvatar name={name} email={email} avatarUrl={avatarUrl} size={44} />
          <span className="hidden md:block max-w-[160px] truncate text-[15px] font-medium text-neutral-900">
            {name || email}
          </span>
        </div>
      </div>

      <MobileNav canManage={canManage} />
    </header>
  );
}
