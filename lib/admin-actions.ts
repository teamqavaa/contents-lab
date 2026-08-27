"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getAdminToken } from "@/lib/admin-auth";
import {
  courseTypesApi,
  coursesApi,
  learningPathsApi,
  quizzesApi,
} from "@/lib/api/courses-api";
import type {
  Course,
  LearningPath,
  Quiz,
} from "@/lib/api/courses-api";

type CourseLevel = Course["level"];

import {
  apiCreateLab,
  apiCreateObjective,
  apiCreateSkill,
  apiDeleteLab,
  apiDeleteObjective,
  apiDeleteSkill,
  apiUpdateLab,
  apiUpdateSkill,
  apiUpdateUser,
} from "@/lib/api/lab-api";

type ActionResult = { ok: boolean; error?: string };

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
    is_active: formData.get("is_active") === "1",
  });
  if (result.ok) revalidatePath("/admin/skills");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateSkillAction(
  id: string,
  fields: { title?: string; slug?: string; description?: string | null; icon?: string; is_active?: boolean }
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

export async function createCourseAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const typeRaw = String(formData.get("type") ?? "");
  const priceRaw = String(formData.get("price") ?? "0");
  const result = await coursesApi.create(token, {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    language: String(formData.get("language") ?? "en"),
    level: String(formData.get("level") ?? "beginner") as CourseLevel,
    instructor: String(formData.get("instructor") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 0),
    price: priceRaw === "" ? "0" : priceRaw,
    type: typeRaw === "" ? null : Number(typeRaw),
    is_active: boolField(formData, "is_active"),
  });
  if (result.ok) revalidatePath("/admin/courses");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateCourseAction(
  id: number,
  fields: Partial<Pick<Course, "title" | "is_active">>
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

export async function createLearningPathAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = await getAdminToken();
  const result = await learningPathsApi.create(token, {
    kind: String(formData.get("kind") ?? "skill") as "skill" | "career",
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    duration_weeks: Number(formData.get("duration_weeks") ?? 0),
    includes_certificate: boolField(formData, "includes_certificate"),
    order: Number(formData.get("order") ?? 0),
    is_active: boolField(formData, "is_active"),
  });
  if (result.ok) revalidatePath("/admin/learning-paths");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateLearningPathAction(
  id: number,
  fields: Partial<Pick<LearningPath, "title" | "is_active">>
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
  const result = await quizzesApi.create(token, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    is_active: boolField(formData, "is_active"),
  });
  if (result.ok) revalidatePath("/admin/quizzes");
  return { ok: result.ok, error: result.error ?? undefined };
}

export async function updateQuizAction(
  id: number,
  fields: Partial<Pick<Quiz, "title" | "is_active">>
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