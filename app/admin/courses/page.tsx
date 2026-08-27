import { CoursesManager } from "@/components/admin/CoursesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { courseTypesApi, coursesApi } from "@/lib/api/courses-api";

export default async function CoursesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [{ data: courses, error }, { data: courseTypes }] = await Promise.all([
    coursesApi.list(token),
    courseTypesApi.list(token),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Courses" count={courses?.length}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
      </PageHeader>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load courses: {error}
        </p>
      ) : (
        <CoursesManager courses={courses ?? []} courseTypes={courseTypes ?? []} />
      )}
    </div>
  );
}