"use server";

import type { Lab } from "@/types/student/lab";
import { LABS_API_URL } from "@/lib/student/labs-api";

export async function getLabsAction(): Promise<{ labs: Lab[]; error: null } | { labs: []; error: string }> {
  try {
    const res = await fetch(`${LABS_API_URL}/api/labs/`, { cache: "no-store" });
    if (!res.ok) {
      return { labs: [], error: `Failed to fetch labs: ${res.status}` };
    }
    const labs: Lab[] = await res.json();
    return { labs, error: null };
  } catch (e) {
    return { labs: [], error: e instanceof Error ? e.message : "Unknown error fetching labs" };
  }
}
