"use server";

import { cookies } from "next/headers";

import { COURSES_API_URL } from "@/lib/student/courses-api";

export type RecommendationPayload = {
  kind: "career" | "skill" | "course" | null;
  reason: string;
  path: {
    id: number;
    kind: "career" | "skill";
    title: string;
    slug: string;
    description: string;
    icon: string;
    duration_weeks: number;
  } | null;
  course: {
    id: number;
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    level: string;
  } | null;
};

export async function getMyRecommendationAction(): Promise<RecommendationPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${COURSES_API_URL}/api/my/recommendation/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}
