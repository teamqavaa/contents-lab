"use server";

import { COURSES_API_URL } from "@/lib/student/courses-api";
import type {
  Course,
  CourseDetail,
  CoursePathContext,
  CurriculumResponse,
} from "@/types/student/course";

export async function getActiveCoursesAction(): Promise<
  { courses: Course[]; error: null } | { courses: []; error: string }
> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/courses/active/`, { cache: "no-store" });
    if (!res.ok) {
      return { courses: [], error: `Failed to fetch courses: ${res.status}` };
    }
    const courses: Course[] = await res.json();
    return { courses, error: null };
  } catch (e) {
    return { courses: [], error: e instanceof Error ? e.message : "Unknown error fetching courses" };
  }
}

export async function getCourseAction(
  id: number
): Promise<{ course: CourseDetail | null; error: null } | { course: null; error: string }> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/courses/${id}/`, { cache: "no-store" });
    if (!res.ok) {
      return { course: null, error: `Failed to fetch course: ${res.status}` };
    }
    const course: CourseDetail = await res.json();
    return { course, error: null };
  } catch (e) {
    return { course: null, error: e instanceof Error ? e.message : "Unknown error fetching course" };
  }
}

export async function getCourseCurriculumAction(
  id: number
): Promise<{ curriculum: CurriculumResponse | null; error: null } | { curriculum: null; error: string }> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/courses/${id}/curriculum/`, { cache: "no-store" });
    if (!res.ok) {
      return { curriculum: null, error: `Failed to fetch curriculum: ${res.status}` };
    }
    const curriculum: CurriculumResponse = await res.json();
    return { curriculum, error: null };
  } catch (e) {
    return { curriculum: null, error: e instanceof Error ? e.message : "Unknown error fetching curriculum" };
  }
}

export async function getCoursePathContextAction(
  id: number
): Promise<{ paths: CoursePathContext[]; error: null } | { paths: []; error: string }> {
  try {
    const res = await fetch(`${COURSES_API_URL}/api/courses/${id}/path-context/`, { cache: "no-store" });
    if (!res.ok) {
      return { paths: [], error: `Failed to fetch path context: ${res.status}` };
    }
    const data: { paths: CoursePathContext[] } = await res.json();
    return { paths: data.paths ?? [], error: null };
  } catch (e) {
    return { paths: [], error: e instanceof Error ? e.message : "Unknown error fetching path context" };
  }
}
