import { BookOpen, LayoutGrid, PenSquare, Settings } from 'lucide-react';

/** Onglets du dashboard (sidebar et navigation mobile). */
export const OVERVIEW_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
] as const;

/** Onglet réservé aux instructeurs et administrateurs (lib/roles.ts → canManageCourses). */
export const MANAGE_LINK = { href: '/dashboard/manage-courses', label: 'Manage courses', icon: PenSquare } as const;

/** Onglets « Overview » visibles par l'utilisateur. */
export function overviewLinks(canManage: boolean) {
  return canManage ? [...OVERVIEW_LINKS, MANAGE_LINK] : [...OVERVIEW_LINKS];
}

export const SETTINGS_LINK = { href: '/dashboard/settings', label: 'Setting', icon: Settings } as const;

export function isActiveLink(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}
