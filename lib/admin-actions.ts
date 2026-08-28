"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getAdminToken } from "@/lib/admin-auth";
import {
  courseRelatedApis,
  courseTypesApi,
  coursesApi,
  learningPathsApi,
  optionsApi,
  questionsApi,
  quizTypesApi,
  quizzesApi,
} from "@/lib/api/courses-api";
import type {
  Course,
  CourseCreateInput,
  CourseRelatedInput,
  CourseRelatedKind,
  CourseUpdateInput,
  LearningPath,
  Quiz,
} from "@/lib/api/courses-api";

type CourseLevel = Course["level"];

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
  id: number,
  fields: Partial<{ name: string; description: string | null; is_virtual: boolean; is_active: boolean }>
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await courseTypesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/categories");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteCategoryAction(id: number): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await courseTypesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/categories");
  return { ok: result.ok, error: result.error ?? undefined };
}

function numNullable(formData: FormData, name: string): number | null {
  const raw = String(formData.get(name) ?? "");
  if (raw === "") return null;
  return Number(raw);
}

function decimalOrZero(formData: FormData, name: string): string {
  const raw = String(formData.get(name) ?? "");
  return raw === "" ? "0" : raw;
}

export async function createCourseAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const typeRaw = String(formData.get("type") ?? "");
  const payload: CourseCreateInput = {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    language: String(formData.get("language") ?? "en"),
    level: String(formData.get("level") ?? "beginner") as CourseLevel,
    instructor: String(formData.get("instructor") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 0),
    price: decimalOrZero(formData, "price"),
    original_price: numNullable(formData, "original_price") !== null
      ? String(formData.get("original_price") ?? "")
      : null,
    rating: numNullable(formData, "rating"),
    review_count: Number(formData.get("review_count") ?? 0),
    thumbnail: String(formData.get("thumbnail") ?? "") || null,
    cohort_label: String(formData.get("cohort_label") ?? ""),
    audience: String(formData.get("audience") ?? ""),
    downloadable_files_count: Number(formData.get("downloadable_files_count") ?? 0),
    type: typeRaw === "" ? null : Number(typeRaw),
    is_active: boolField(formData, "is_active"),
  };
  const result = await coursesApi.create(token, payload);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateCourseAction(
  id: number,
  fields: CourseUpdateInput
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await coursesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteCourseAction(id: number): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await coursesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- course inline resources (mirrors the four Django admin inlines) ---

export async function createCourseRelatedAction(
  kind: CourseRelatedKind,
  input: CourseRelatedInput
): Promise<ActionResult> {
  const token = await getAdminToken();
  const api = courseRelatedApis[kind];
  const result = await api.create(token, input);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateCourseRelatedAction(
  kind: CourseRelatedKind,
  id: number,
  input: CourseRelatedInput
): Promise<ActionResult> {
  const token = await getAdminToken();
  const api = courseRelatedApis[kind];
  const result = await api.update(token, id, input);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteCourseRelatedAction(
  kind: CourseRelatedKind,
  id: number
): Promise<ActionResult> {
  const token = await getAdminToken();
  const api = courseRelatedApis[kind];
  const result = await api.remove(token, id);
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

// --- quiz sub-resources (questions and their options) ---

export async function createQuestionAction(
  quizId: number,
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
  id: number,
  fields: { text: string; order: number; is_active: boolean }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await questionsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteQuestionAction(id: number): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await questionsApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function createOptionAction(
  questionId: number,
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
  id: number,
  fields: { text: string; order: number; is_correct: boolean }
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await optionsApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteOptionAction(id: number): Promise<ActionResult> {
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
    courses: formData.getAll("courses").map(Number),
  });
  if (result.ok) revalidatePath("/admin/learning-paths");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateLearningPathAction(
  id: number,
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

export async function deleteLearningPathAction(id: number): Promise<ActionResult> {
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
  const result = await quizzesApi.create(token, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    type_quiz: typeRaw === "" ? null : Number(typeRaw),
    is_active: boolField(formData, "is_active"),
  });
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateQuizAction(
  id: number,
  fields: Partial<Pick<Quiz, "title" | "description" | "type_quiz" | "is_active">>
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await quizzesApi.update(token, id, fields);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function deleteQuizAction(id: number): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await quizzesApi.remove(token, id);
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}