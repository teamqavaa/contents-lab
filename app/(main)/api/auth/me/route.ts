// app/api/auth/me/route.ts — session de l'utilisateur pour les composants client (header, menu mobile)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getMyProfile } from "@/actions/settings";
import { getConnectedUser } from "@/actions/user";
import { canManageCourses } from "@/lib/roles";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Le token httpOnly n'est jamais renvoyé : seulement ce que l'interface affiche
  const [user, profile] = await Promise.all([getConnectedUser(), getMyProfile()]);
  return NextResponse.json({
    authenticated: true,
    user: user
      ? {
          name: user.name,
          email: user.email,
          avatarUrl: profile?.avatar ?? null,
          canManageCourses: canManageCourses(user),
        }
      : null,
  });
}
