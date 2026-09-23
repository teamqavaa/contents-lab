"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";
import type { Course } from "@/types/student/course";

// The backend enrollment serializer embeds the full course record under
// `course_details`, so "My Courses" can render enrolled courses directly
// without a second round-trip to the catalog.
export type Enrollment = {
  id: number;
  course: number; // course primary key
  course_details: Course;
  enrolled_at: string;
  last_accessed_at: string;
  progress_percentage: string;
  status: "active" | "completed" | "suspended";
};

type EnrollmentsResult =
  | { enrollments: Enrollment[]; error: null }
  | { enrollments: []; error: string };

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

// Lists only the caller's active enrollments via GET /api/enrollments/.
// Guests see an empty list instead of erroring, mirroring the progress actions.
export async function getMyEnrollmentsAction(): Promise<EnrollmentsResult> {
  try {
    const headers = await authHeaders();
    if (!hasToken(headers)) {
      return { enrollments: [], error: null };
    }
    const res = await fetch(`${COURSES_API_URL}/api/enrollments/`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        enrollments: [],
        error: `Failed to fetch enrollments: ${res.status}`,
      };
    }
    const enrollments: Enrollment[] = await res.json();
    return { enrollments, error: null };
  } catch (e) {
    return {
      enrollments: [],
      error: e instanceof Error ? e.message : "Unknown error fetching enrollments",
    };
  }
}