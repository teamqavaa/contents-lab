"use server";

import { cookies } from "next/headers";
import { LABS_API_URL } from "@/lib/student/labs-api";

export type ProgressEntry = {
  lab_id: string;
  status: string;
  attempts: number;
  completed_at: string | null;
  completed_steps: number;
  total_steps: number;
  progress_percent: number;
};

export async function getProgressAction(): Promise<ProgressEntry[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return [];

  try {
    const res = await fetch(`${LABS_API_URL}/api/progress/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch {
    return [];
  }
}
