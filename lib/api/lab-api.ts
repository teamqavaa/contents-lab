// Staff-facing client for the labs-domain admin API (courses-api). Every call
// carries the SSO access token from the httpOnly cookie; the backend rejects
// non-staff.
import { COURSES_API_URL } from "./courses-api";

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
  // Parsed body of a non-2xx response when it was JSON; bulk endpoints return
  // per-row errors there.
  detail?: unknown;
};

async function adminFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      let detail: unknown = null;
      try {
        detail = await res.json();
      } catch {
        // Non-JSON error body; nothing to surface.
      }
      return { ok: false, data: null, error: `Request failed (${res.status})`, status: res.status, detail };
    }
    if (res.status === 204) {
      return { ok: true, data: null, error: null, status: 204 };
    }
    const body = (await res.json()) as T;
    return { ok: true, data: body, error: null, status: res.status };
  } catch (e) {
    return {
      ok: false,
      data: null,
      error: e instanceof Error ? e.message : "Network error",
      status: 0,
    };
  }
}

export type Skill = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  order: number;
  is_active: boolean;
};

export type Lab = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  status: string;
  difficulty: string;
  skill: string | null;
  skill_slug: string;
  created_at: string;
  starter_code: string;
  objectives: LabObjective[];
};

export type LabObjective = {
  id: string;
  lab: string;
  order: number;
  title: string;
  content: string;
  hint: string | null;
  starter_code: string;
};

export type AdminUser = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
};

export type AdminUserCreateInput = {
  full_name?: string | null;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  is_active?: boolean;
  is_staff?: boolean;
  language?: string;
  password?: string;
};

export type BulkUserError = {
  row: number;
  field: string;
  message: string;
};

export type BulkUsersResult = {
  created: number;
  updated: number;
  errors: BulkUserError[];
};

export async function apiBulkUsers(
  token: string,
  payload: { mode: "create" | "upsert"; rows: Record<string, unknown>[] }
) {
  return adminFetch<BulkUsersResult>(token, "/api/admin/users/bulk/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiListSkills(token: string) {
  return adminFetch<Skill[]>(token, "/api/admin/skills/");
}

export async function apiCreateSkill(token: string, payload: Partial<Skill>) {
  return adminFetch<Skill>(token, "/api/admin/skills/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateSkill(token: string, id: string, payload: Partial<Skill>) {
  return adminFetch<Skill>(token, `/api/admin/skills/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteSkill(token: string, id: string) {
  return adminFetch<void>(token, `/api/admin/skills/${id}/`, { method: "DELETE" });
}

export async function apiListLabs(token: string) {
  return adminFetch<Lab[]>(token, "/api/admin/labs/");
}

export async function apiCreateLab(token: string, payload: Partial<Lab>) {
  return adminFetch<Lab>(token, "/api/admin/labs/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateLab(token: string, id: string, payload: Partial<Lab>) {
  return adminFetch<Lab>(token, `/api/admin/labs/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteLab(token: string, id: string) {
  return adminFetch<void>(token, `/api/admin/labs/${id}/`, { method: "DELETE" });
}

export async function apiListObjectives(token: string, labId: string) {
  return adminFetch<LabObjective[]>(token, `/api/admin/labs/${labId}/objectives/`);
}

export async function apiCreateObjective(token: string, labId: string, payload: Partial<LabObjective>) {
  return adminFetch<LabObjective>(token, `/api/admin/labs/${labId}/objectives/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateObjective(
  token: string,
  labId: string,
  objectiveId: string,
  payload: Partial<LabObjective>
) {
  return adminFetch<LabObjective>(token, `/api/admin/labs/${labId}/objectives/${objectiveId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteObjective(token: string, labId: string, objectiveId: string) {
  return adminFetch<void>(token, `/api/admin/labs/${labId}/objectives/${objectiveId}/`, {
    method: "DELETE",
  });
}

export async function apiListUsers(token: string, role?: string) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  return adminFetch<AdminUser[]>(token, `/api/admin/users/${query}`);
}

export async function apiCreateUser(token: string, payload: AdminUserCreateInput) {
  return adminFetch<AdminUser>(token, "/api/admin/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateUser(token: string, id: string, payload: Partial<AdminUser>) {
  return adminFetch<AdminUser>(token, `/api/admin/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}