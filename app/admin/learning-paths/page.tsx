import { LearningPathsManager } from "@/components/admin/LearningPathsManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { coursesApi, learningPathsApi } from "@/lib/api/courses-api";

export default async function LearningPathsPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [pathsRes, coursesRes] = await Promise.all([
    learningPathsApi.list(token),
    coursesApi.list(token),
  ]);
  const paths = pathsRes.data ?? [];
  const courses = coursesRes.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Learning Paths" count={paths.length}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
      </PageHeader>
      {pathsRes.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load learning paths: {pathsRes.error}
        </p>
      ) : (
        <LearningPathsManager paths={paths} courses={courses} />
      )}
    </div>
  );
}