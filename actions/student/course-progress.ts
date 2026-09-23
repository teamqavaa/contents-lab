"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type CourseProgressEntry = {
  course_id: number;
  status: ProgressStatus;
  progress_percent: number;
  completed_at: string | null;
  updated_at?: string;
};

type ProgressResult =
  | { progress: CourseProgressEntry[]; error: null }
  | { progress: []; error: string };

async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function hasToken(headers: Record<string, string>): boolean {
  return Boolean(headers.Authorization);
}

// Guests see an empty map; every step renders as not-started instead of erroring.
export async function getMyPathProgressAction(pathSlug: string): Promise<ProgressResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { progress: [], error: null };
    }
    const res = await fetch(`${COURSES_API_URL}/api/my/progress/?path=${encodeURIComponent(pathSlug)}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { progress: [], error: `Failed to fetch progress: ${res.status}` };
    }
    const progress: CourseProgressEntry[] = await res.json();
    return { progress, error: null };
  } catch (e) {
    return { progress: [], error: e instanceof Error ? e.message : "Unknown error fetching progress" };
  }
}

// Unscoped list for the dashboard: newest-touched rows first.
export async function getMyProgressAction(status?: ProgressStatus): Promise<ProgressResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { progress: [], error: null };
    }
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    const query = params.toString();
    const res = await fetch(`${COURSES_API_URL}/api/my/progress/${query ? `?${query}` : ""}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { progress: [], error: `Failed to fetch progress: ${res.status}` };
    }
    const progress: CourseProgressEntry[] = await res.json();
    return { progress, error: null };
  } catch (e) {
    return { progress: [], error: e instanceof Error ? e.message : "Unknown error fetching progress" };
  }
}

export async function getMyCourseProgressAction(
  courseId: number
): Promise<{ entry: CourseProgressEntry | null; error: string | null }> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { entry: null, error: null };
    }
    const res = await fetch(`${COURSES_API_URL}/api/my/progress/${courseId}/`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { entry: null, error: `Failed to fetch course progress: ${res.status}` };
    }
    const data = (await res.json()) as CourseProgressEntry & { course_id?: number };
    return { entry: { ...data, course_id: data.course_id ?? courseId }, error: null };
  } catch (e) {
    return { entry: null, error: e instanceof Error ? e.message : "Unknown error fetching course progress" };
  }
}

async function postProgressAction(
  courseId: number | string,
  action: "start" | "complete" | "uncomplete"
): Promise<{ ok: boolean; error: string | null }> {
  const headers = await authHeaders();
  if (!hasToken(headers)) {
    return { ok: false, error: "You must be logged in." };
  }
  try {
    const res = await fetch(`${COURSES_API_URL}/api/my/progress/${courseId}/${action}/`, {
      method: "POST",
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `Progress update failed: ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error updating progress" };
  }
}

export async function startCourseAction(courseId: number | string) {
  return postProgressAction(courseId, "start");
}

export async function completeCourseAction(courseId: number | string) {
  return postProgressAction(courseId, "complete");
}

export async function uncompleteCourseAction(courseId: number | string) {
  return postProgressAction(courseId, "uncomplete");
}
