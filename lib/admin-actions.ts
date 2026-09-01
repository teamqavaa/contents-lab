"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getAdminToken } from "@/lib/admin-auth";
import {
  apiBulkCourses,
  courseTypesApi,
  djangoCategoriesApi,
  djangoCoursesApi,
  djangoCoursesSlugApi,
  djangoHighlightsApi,
  djangoLearningPointsApi,
  djangoLessonsApi,
  djangoModulesApi,
  djangoOutcomesApi,
  djangoTagsApi,
  djangoTypeCoursesApi,
  djangoVideosApi,
  learningPathsApi,
  optionsApi,
  questionsApi,
  quizzesApi,
} from "@/lib/api/courses-api";
import type { LearningPath, Quiz } from "@/lib/api/courses-api";

import {
  apiBulkUsers,
  apiCreateLab,
  apiCreateObjective,
  apiCreateSkill,
  apiCreateUser,
  apiDeleteLab,
  apiDeleteObjective,
  apiDeleteSkill,
  apiUpdateLab,
  apiUpdateObjective,
  apiUpdateSkill,
  apiUpdateUser,
} from "@/lib/api/lab-api";
import type { AdminUserCreateInput } from "@/lib/api/lab-api";

type ActionResult = { ok: boolean; error?: string };

export type ImportUsersResult = {
  ok: boolean;
  created: number;
  updated: number;
  error?: string;
  errors?: { row: number; field: string; message: string }[];
};

export async function importUsersAction(
  mode: "create" | "upsert",
  rows: Record<string, unknown>[]
): Promise<ImportUsersResult> {
  const token = await getAdminToken();
  const result = await apiBulkUsers(token, { mode, rows });
  if (result.ok) revalidatePath("/admin/users");

  // Bulk 400s carry per-row errors in the JSON body, not in `error`.
  const detail = (result.detail ?? null) as
    | { errors?: { row: number; field: string; message: string }[] }
    | null;

  return {
    ok: result.ok,
    created: result.data?.created ?? 0,
    updated: result.data?.updated ?? 0,
    error: result.error ?? undefined,
    errors: result.ok ? undefined : (detail?.errors ?? undefined),
  };
}

export type ImportCoursesResult = {
  ok: boolean;
  created: number;
  updated: number;
  error?: string;
  errors?: { row: number; field: string; message: string }[];
};

export async function importCoursesAction(
  mode: "create" | "upsert",
  rows: Record<string, unknown>[]
): Promise<ImportCoursesResult> {
  const token = await getAdminToken();
  const result = await apiBulkCourses(token, { mode, rows });
  if (result.ok) revalidatePath("/admin/courses");

  // Bulk 400s carry per-row errors in the JSON body, not in `error`.
  const detail = (result.detail ?? null) as
    | { errors?: { row: number; field: string; message: string }[] }
    | null;

  return {
    ok: result.ok,
    created: result.data?.created ?? 0,
    updated: result.data?.updated ?? 0,
    error: result.error ?? undefined,
    errors: result.ok ? undefined : (detail?.errors ?? undefined),
  };
}

export async function createUserAction(
  input: AdminUserCreateInput
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiCreateUser(token, input);
  if (result.ok) revalidatePath("/admin/users");

  // DRF 400s carry a field -> message list dict; flatten it for display.
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

// Identity Portal base URL; logout hands the user back to the login screen.
const SSO_PORTAL_URL =
  process.env.SSO_PORTAL_URL ?? "http://localhost:3001";

export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect(`${SSO_PORTAL_URL}/`);
}

export async function createSkillAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiCreateSkill(token, {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    icon: String(formData.get("icon") ?? ""),
    order: Number(formData.get("order") ?? 0),
    is_active: formData.get("is_active") === "1",
  });
  if (result.ok) revalidatePath("/admin/skills");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateSkillAction(
  id: string,
  fields: {
    title?: string;
    slug?: string;
    description?: string | null;
    icon?: string;
    order?: number;
    is_active?: boolean;
  }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiUpdateSkill(token, id, fields);
  if (result.ok) revalidatePath("/admin/skills");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiDeleteSkill(token, id);
  if (result.ok) revalidatePath("/admin/skills");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createLabAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiCreateLab(token, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    language: String(formData.get("language") ?? "python"),
    status: String(formData.get("status") ?? "draft"),
    difficulty: String(formData.get("difficulty") ?? "guided"),
    skill: (String(formData.get("skill") ?? "") || null) as string | null,
    starter_code: String(formData.get("starter_code") ?? ""),
  });
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateLabAction(formData: FormData): Promise<ActionResult> {
  const token = await getAdminToken();
  const id = String(formData.get("id") ?? "");
  const result = await apiUpdateLab(token, id, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    language: String(formData.get("language") ?? "python"),
    status: String(formData.get("status") ?? "draft"),
    difficulty: String(formData.get("difficulty") ?? "guided"),
    skill: (String(formData.get("skill") ?? "") || null) as string | null,
    starter_code: String(formData.get("starter_code") ?? ""),
  });
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteLabAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiDeleteLab(token, id);
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createObjectiveAction(
  labId: string,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiCreateObjective(token, labId, {
    order: Number(formData.get("order") ?? 1),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    hint: String(formData.get("hint") ?? "") || null,
    starter_code: String(formData.get("starter_code") ?? ""),
  });
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteObjectiveAction(
  labId: string,
  objectiveId: string
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiDeleteObjective(token, labId, objectiveId);
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateObjectiveAction(
  labId: string,
  objectiveId: string,
  fields: {
    order: number;
    title: string;
    content: string;
    hint: string | null;
    starter_code: string;
  }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiUpdateObjective(token, labId, objectiveId, fields);
  if (result.ok) revalidatePath("/admin/labs");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateUserRoleAction(
  id: string,
  role: string
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiUpdateUser(token, id, { role });
  if (result.ok) revalidatePath("/admin/users");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function toggleUserActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await apiUpdateUser(token, id, { is_active: isActive });
  if (result.ok) revalidatePath("/admin/users");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- courses-api admin actions (staff-only, guarded server-side too) ---

function boolField(formData: FormData, name: string): boolean {
  return formData.get(name) === "1";
}

export async function createCategoryAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await courseTypesApi.create(token, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    is_virtual: boolField(formData, "is_virtual"),
    is_active: boolField(formData, "is_active"),
  });
  if (result.ok) revalidatePath("/admin/categories");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateCategoryAction(
  id: string,
  fields: Partial<{ name: string; description: string | null; is_virtual: boolean; is_active: boolean }>
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await courseTypesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/categories");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await courseTypesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/categories");
  return { ok: result.ok, error: result.error ?? undefined };
}

// Attaches a quiz to a course or module through the polymorphic link.
export async function updateQuizLinkAction(
  id: string,
  link: { content_type: number | null; object_id: number | null }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await quizzesApi.update(token, id, link);
  if (result.ok) {
    revalidatePath("/admin/quizzes");
    revalidatePath("/admin/courses");
  }
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- quiz sub-resources (questions and their options) ---

export async function createQuestionAction(
  quizId: string,
  text: string,
  order: number
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await questionsApi.create(token, {
    quiz: quizId,
    text,
    order,
    is_active: true,
  });
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateQuestionAction(
  id: string,
  fields: { text: string; order: number; is_active: boolean }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await questionsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteQuestionAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await questionsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createOptionAction(
  questionId: string,
  text: string,
  order: number,
  isCorrect: boolean
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await optionsApi.create(token, {
    question: questionId,
    text,
    order,
    is_correct: isCorrect,
  });
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateOptionAction(
  id: string,
  fields: { text: string; order: number; is_correct: boolean }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await optionsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteOptionAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await optionsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createLearningPathAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await learningPathsApi.create(token, {
    kind: String(formData.get("kind") ?? "skill") as "skill" | "career",
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    icon: String(formData.get("icon") ?? ""),
    pace: String(formData.get("pace") ?? ""),
    duration_weeks: Number(formData.get("duration_weeks") ?? 0),
    includes_certificate: boolField(formData, "includes_certificate"),
    order: Number(formData.get("order") ?? 0),
    is_active: boolField(formData, "is_active"),
    courses: formData.getAll("courses").map(String),
  });
  if (result.ok) revalidatePath("/admin/learning-paths");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateLearningPathAction(
  id: string,
  fields: Partial<
    Pick<
      LearningPath,
      | "title"
      | "description"
      | "icon"
      | "pace"
      | "kind"
      | "duration_weeks"
      | "includes_certificate"
      | "order"
      | "is_active"
      | "courses"
    >
  >
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await learningPathsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/learning-paths");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteLearningPathAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await learningPathsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/learning-paths");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createQuizAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const typeRaw = String(formData.get("type_quiz") ?? "");
  const contentTypeRaw = String(formData.get("content_type") ?? "");
  const objectIdRaw = String(formData.get("object_id") ?? "");
  const linkFields =
    contentTypeRaw === "" || objectIdRaw === ""
      ? {}
      : { content_type: Number(contentTypeRaw), object_id: Number(objectIdRaw) };
  const result = await quizzesApi.create(token, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    type_quiz: typeRaw === "" ? null : typeRaw,
    is_active: boolField(formData, "is_active"),
    ...linkFields,
  });
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateQuizAction(
  id: string,
  fields: Partial<
    Pick<Quiz, "title" | "description" | "type_quiz" | "is_active" | "content_type" | "object_id">
  >
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await quizzesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteQuizAction(id: string): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await quizzesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

// =========================================================================
// Django model-aligned actions (UUID IDs, /api/ paths, correct field names)
// =========================================================================

export type DjangoActionResult = { ok: boolean; error?: string; data?: unknown };

// --- Course Types ---

export async function fetchDjangoCourseTypesAction(): Promise<{
  ok: boolean;
  data: { id: string; name: string; slug: string; description: string; is_virtual: boolean; is_active: boolean }[];
}> {
  const token = await getAdminToken();
  const result = await djangoTypeCoursesApi.list(token);
  return { ok: result.ok, data: (result.data ?? []) as never[] };
}

// --- Categories ---

export async function fetchDjangoCategoriesAction(): Promise<{
  ok: boolean;
  data: { id: string; name: string; slug: string; description: string; parent: string | null; subcategories: unknown[]; is_active: boolean }[];
}> {
  const token = await getAdminToken();
  const result = await djangoCategoriesApi.list(token);
  return { ok: result.ok, data: (result.data ?? []) as never[] };
}

// --- Tags ---

export async function fetchDjangoTagsAction(): Promise<{
  ok: boolean;
  data: { id: string; name: string; slug: string }[];
}> {
  const token = await getAdminToken();
  const result = await djangoTagsApi.list(token);
  return { ok: result.ok, data: (result.data ?? []) as never[] };
}

// --- Courses ---

export async function createDjangoCourseAction(input: {
  category: string;
  title: string;
  subtitle?: string;
  description: string;
  language?: string;
  level?: string;
  status?: string;
  price: string;
  discount_price?: string;
  tags?: string[];
  thumbnail?: string;
  promo_video_url?: string;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoCoursesApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoCourseAction(
  slug: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoCoursesSlugApi.update(token, slug, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoCourseAction(slug: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoCoursesSlugApi.remove(token, slug);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Modules ---

export async function createDjangoModuleAction(input: {
  course: string;
  title: string;
  description?: string;
  order: number;
  is_published?: boolean;
  is_free?: boolean;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoModulesApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoModuleAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoModulesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoModuleAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoModulesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Lessons ---

export async function createDjangoLessonAction(input: {
  module: string;
  title: string;
  description?: string;
  lesson_type?: string;
  duration_in_minutes?: number;
  order: number;
  is_preview?: boolean;
  is_published?: boolean;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLessonsApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoLessonAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLessonsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoLessonAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLessonsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Videos ---

export async function createDjangoVideoAction(input: {
  lesson: string;
  title: string;
  provider?: string;
  video_url: string;
  external_id?: string;
  thumbnail_url?: string;
  duration_in_seconds?: number;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoVideosApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoVideoAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoVideosApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoVideoAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoVideosApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Outcomes ---

export async function createDjangoOutcomeAction(input: {
  course: string;
  description: string;
  category?: string;
  icon?: string;
  order: number;
  is_highlighted?: boolean;
  is_published?: boolean;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoOutcomesApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoOutcomeAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoOutcomesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoOutcomeAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoOutcomesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Highlights ---

export async function createDjangoHighlightAction(input: {
  course: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  is_published?: boolean;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoHighlightsApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoHighlightAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoHighlightsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoHighlightAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoHighlightsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- Learning Points ---

export async function createDjangoLearningPointAction(input: {
  course: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  is_published?: boolean;
}): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLearningPointsApi.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    data: result.data,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function updateDjangoLearningPointAction(
  id: string,
  fields: Record<string, unknown>
): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLearningPointsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  const detail = result.detail as Record<string, string[]> | null;
  return {
    ok: result.ok,
    error:
      result.ok || !detail
        ? (result.error ?? undefined)
        : Object.entries(detail)
            .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
            .join("; "),
  };
}

export async function deleteDjangoLearningPointAction(id: string): Promise<DjangoActionResult> {
  const token = await getAdminToken();
  const result = await djangoLearningPointsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export type CourseRelatedData = {
  outcomes: unknown[];
  highlights: unknown[];
  learningPoints: unknown[];
  modules: unknown[];
  lessons: unknown[];
  videos: unknown[];
};

export async function fetchDjangoCourseRelatedDataAction(): Promise<{
  ok: boolean;
  data: CourseRelatedData | null;
  error?: string;
}> {
  const token = await getAdminToken();
  const [outcomes, highlights, learningPoints, modules, lessons, videos] =
    await Promise.all([
      djangoOutcomesApi.list(token),
      djangoHighlightsApi.list(token),
      djangoLearningPointsApi.list(token),
      djangoModulesApi.list(token),
      djangoLessonsApi.list(token),
      djangoVideosApi.list(token),
    ]);
  if (
    outcomes.ok &&
    highlights.ok &&
    learningPoints.ok &&
    modules.ok &&
    lessons.ok &&
    videos.ok
  ) {
    return {
      ok: true,
      data: {
        outcomes: outcomes.data ?? [],
        highlights: highlights.data ?? [],
        learningPoints: learningPoints.data ?? [],
        modules: modules.data ?? [],
        lessons: lessons.data ?? [],
        videos: videos.data ?? [],
      },
    };
  }
  return { ok: false, data: null, error: "Failed to refresh course data" };
}