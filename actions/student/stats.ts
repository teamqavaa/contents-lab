"use server";

import { cookies } from "next/headers";
import { COURSES_API_URL } from "@/lib/student/courses-api";

export type WeekDay = {
  date: string;
  practiced: boolean;
  is_today: boolean;
};

export type StatsData = {
  labs_completed: number;
  hours_practiced: number;
  current_streak: number;
  week: WeekDay[];
};

const DEFAULT_STATS: StatsData = {
  labs_completed: 0,
  hours_practiced: 0,
  current_streak: 0,
  week: [],
};

export async function getStatsAction(): Promise<StatsData> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return DEFAULT_STATS;

  try {
    const res = await fetch(`${COURSES_API_URL}/api/stats/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return DEFAULT_STATS;

    return await res.json();
  } catch {
    return DEFAULT_STATS;
  }
}
