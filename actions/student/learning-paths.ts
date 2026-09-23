"use server";

import { COURSES_API_URL } from "@/lib/student/courses-api";
import type { Course } from "@/types/student/course";
import type { LearningPath, PathKind } from "@/types/student/career-path";

export async function getActivePathsAction(
  kind?: PathKind
): Promise<
  { paths: LearningPath[]; error: null } | { paths: []; error: string }
> {
  try {
    const url = new URL(`${COURSES_API_URL}/api/learning-paths/active/`);
    if (kind) {
      url.searchParams.set("kind", kind);
    }
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { paths: [], error: `Failed to fetch learning paths: ${res.status}` };
    }
    const paths: LearningPath[] = await res.json();
    return { paths, error: null };
  } catch (e) {
    return { paths: [], error: e instanceof Error ? e.message : "Unknown error fetching learning paths" };
  }
}

export async function getPathCoursesAction(
  id: number
): Promise<{ courses: Course[]; error: null } | { courses: []; error: string }> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/learning-paths/${id}/courses/`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { courses: [], error: `Failed to fetch path courses: ${res.status}` };
    }
    const courses: Course[] = await res.json();
    return { courses, error: null };
  } catch (e) {
    return { courses: [], error: e instanceof Error ? e.message : "Unknown error fetching path courses" };
  }
}
