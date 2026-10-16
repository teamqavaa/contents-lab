// app/(main)/page.tsx — accueil : page d'apprentissage si l'utilisateur est connecté, sinon page vitrine
import { cookies } from "next/headers";

import { getPublishedCourses } from "@/actions/catalog";
import { getLearningStats, getMyEnrollments } from "@/actions/dashboard";
import { getConnectedUser } from "@/actions/user";
import HomePage from "@/components/home/Home";
import LearningHome from "@/components/learning/LearningHome";

// Dépend des cookies de session
export const dynamic = "force-dynamic";

export default async function Home() {
  // Le cas « connecté + ?redirect= » est géré par proxy.ts
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return <HomePage />;

  const [user, enrollments, stats, catalog] = await Promise.all([
    getConnectedUser(),
    getMyEnrollments(),
    getLearningStats(30),
    getPublishedCourses(),
  ]);
  // Token refusé par le SSO (session révoquée) : page vitrine
  if (!user) return <HomePage />;

  return <LearningHome user={user} enrollments={enrollments} stats={stats} catalog={catalog} />;
}
