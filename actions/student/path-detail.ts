"use server";

import { COURSES_API_URL } from "@/lib/student/courses-api";
import type { LearningPathDetail } from "@/types/student/career-path";

export async function getPathDetailAction(
  id: number
): Promise<
  { detail: LearningPathDetail; error: null } | { detail: null; error: string }
> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/learning-paths/${id}/detail/`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { detail: null, error: `Failed to fetch path detail: ${res.status}` };
    }
    const detail: LearningPathDetail = await res.json();
    return { detail, error: null };
  } catch (e) {
    return { detail: null, error: e instanceof Error ? e.message : "Unknown error fetching path detail" };
  }
}
