// lib/roles.ts — droits de l'utilisateur SSO côté front (miroir de core/sso.py dans courses-api)

interface RoleHolder {
  roles?: string[] | null;
  is_staff?: boolean;
  is_superuser?: boolean;
}

const ADMIN_ROLES = ['admin', 'superadmin', 'superuser'];

/** Administrateur : rôle admin / superadmin / superuser, ou compte is_staff / is_superuser du SSO. */
export function isAdmin(user?: RoleHolder | null): boolean {
  if (!user) return false;
  return Boolean(user.is_staff || user.is_superuser || user.roles?.some((role) => ADMIN_ROLES.includes(role)));
}

export function isInstructor(user?: RoleHolder | null): boolean {
  return Boolean(user?.roles?.includes('instructor'));
}

/** Accès à l'onglet « Manage courses » du dashboard. */
export function canManageCourses(user?: RoleHolder | null): boolean {
  return isAdmin(user) || isInstructor(user);
}
