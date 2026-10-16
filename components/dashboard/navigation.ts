import { BookOpen, LayoutGrid, Settings } from 'lucide-react';

/** Onglets du dashboard (sidebar et navigation mobile). */
export const OVERVIEW_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
] as const;

export const SETTINGS_LINK = { href: '/dashboard/settings', label: 'Setting', icon: Settings } as const;

export function isActiveLink(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}
