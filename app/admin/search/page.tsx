import { PageHeader } from "@/components/admin/PageHeader";
import { AdminSearchResults } from "@/components/admin/AdminSearchResults";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListLabs, apiListSkills, apiListUsers } from "@/lib/api/lab-api";
import {
  courseTypesApi,
  coursesApi,
  learningPathsApi,
  quizzesApi,
} from "@/lib/api/courses-api";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const token = await getAdminToken();
  const { q } = await searchParams;

  const [
    skillsRes,
    labsRes,
    usersRes,
    coursesRes,
    courseTypesRes,
    quizzesRes,
    learningPathsRes,
  ] = await Promise.all([
    apiListSkills(token),
    apiListLabs(token),
    apiListUsers(token),
    coursesApi.list(token),
    courseTypesApi.list(token),
    quizzesApi.list(token),
    learningPathsApi.list(token),
  ]);

  const hasError = [
    skillsRes,
    labsRes,
    usersRes,
    coursesRes,
    courseTypesRes,
    quizzesRes,
    learningPathsRes,
  ].some((result) => !result.ok);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Search" />
      <AdminSearchResults
        initialQuery={q ?? ""}
        hasError={hasError}
        skills={skillsRes.data ?? []}
        labs={labsRes.data ?? []}
        users={usersRes.data ?? []}
        courses={coursesRes.data ?? []}
        courseTypes={courseTypesRes.data ?? []}
        quizzes={quizzesRes.data ?? []}
        learningPaths={learningPathsRes.data ?? []}
      />
    </div>
  );
}