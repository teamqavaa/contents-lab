import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const LABS_API_URL = process.env.LABS_API_URL ?? "http://localhost:8000";

// Minimal shape returned by /api/users/me/ that the admin gate needs.
export type AdminSession = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  role: string;
  is_staff: boolean;
};

async function fetchMe(token: string): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${LABS_API_URL}/api/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data === "object" ? (data as AdminSession) : null;
  } catch {
    return null;
  }
}

// Server-side gate for the admin area. Redirects to the SSO portal when no
// token exists, blocks non-staff, and returns the session for staff pages.
export async function requireAdmin(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/");
    // Unreachable; keeps the type checker satisfied.
    throw new Error("redirect");
  }

  const session = await fetchMe(token);
  if (!session || !session.is_staff) {
    redirect("/not-authorized");
    throw new Error("redirect");
  }

  return session;
}

// Returns the access token for staff server actions that call the admin APIs.
export async function getAdminToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? "";
}

export { fetchMe };