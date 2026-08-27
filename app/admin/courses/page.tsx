import { CoursesManager } from "@/components/admin/CoursesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import {
  courseRelatedApis,
  courseTypesApi,
  coursesApi,
} from "@/lib/api/courses-api";

export default async function CoursesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [coursesRes, courseTypesRes, highlights, outcomes, learningPoints, requirements] =
    await Promise.all([
      coursesApi.list(token),
      courseTypesApi.list(token),
      courseRelatedApis.highlights.list(token),
      courseRelatedApis.outcomes.list(token),
      courseRelatedApis.learning_points.list(token),
      courseRelatedApis.requirements.list(token),
    ]);
  const courseTypes = courseTypesRes.data ?? [];
  const courses = coursesRes.data ?? [];
  const relatedByKind = {
    highlights: highlights.data ?? [],
    outcomes: outcomes.data ?? [],
    learning_points: learningPoints.data ?? [],
    requirements: requirements.data ?? [],
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Courses" count={courses.length}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
      </PageHeader>
      {coursesRes.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load courses: {coursesRes.error}
        </p>
      ) : (
        <CoursesManager
          courses={courses}
          courseTypes={courseTypes}
          relatedByKind={relatedByKind}
        />
      )}
    </div>
  );
}