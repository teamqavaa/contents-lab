// components/header/navigation.ts — onglets du site (header desktop et menu mobile)

export const SITE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Browse Courses', href: '/courses' },
  { label: 'Explore Careers', href: '/career-tracks' },
] as const;

export function isSiteLinkActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/** Liens du menu utilisateur connecté (routes protégées par proxy.ts). */
export const ACCOUNT_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My courses', href: '/dashboard/courses' },
  { label: 'My labs', href: '/dashboard/labs' },
  { label: 'Settings', href: '/dashboard/settings' },
] as const;

export const MANAGE_COURSES_LINK = { label: 'Manage courses', href: '/dashboard/manage-courses' } as const;
export const MANAGE_LABS_LINK = { label: 'Manage labs', href: '/dashboard/manage-labs' } as const;

/** Liens du menu utilisateur ; la gestion (cours, labs) seulement si lib/roles.ts → canManageCourses. */
export function accountLinks(canManage?: boolean) {
  const [dashboard, courses, labs, settings] = ACCOUNT_LINKS;
  return canManage
    ? [dashboard, courses, labs, MANAGE_COURSES_LINK, MANAGE_LABS_LINK, settings]
    : [dashboard, courses, labs, settings];
}

export const LOGIN_URL = '/api/auth/login?mode=login';
export const REGISTER_URL = '/api/auth/login?mode=register';
