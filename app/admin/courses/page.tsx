import { CoursesManager } from "@/components/admin/CoursesManager";
import { ImportCoursesDialog } from "@/components/admin/ImportCoursesDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import {
  djangoCategoriesApi,
  djangoCoursesApi,
  djangoHighlightsApi,
  djangoLearningPointsApi,
  djangoLessonsApi,
  djangoModulesApi,
  djangoOutcomesApi,
  djangoTagsApi,
  djangoTypeCoursesApi,
  djangoVideosApi,
} from "@/lib/api/courses-api";
import { apiListLabs } from "@/lib/api/lab-api";
import type { Lab } from "@/lib/api/lab-api";

export default async function CoursesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [
    coursesRes,
    courseTypesRes,
    categoriesRes,
    tagsRes,
    outcomesRes,
    highlightsRes,
    learningPointsRes,
    modulesRes,
    lessonsRes,
    videosRes,
    drLabsRes,
  ] = await Promise.all([
    djangoCoursesApi.list(token),
    djangoTypeCoursesApi.list(token),
    djangoCategoriesApi.list(token),
    djangoTagsApi.list(token),
    djangoOutcomesApi.list(token),
    djangoHighlightsApi.list(token),
    djangoLearningPointsApi.list(token),
    djangoModulesApi.list(token),
    djangoLessonsApi.list(token),
    djangoVideosApi.list(token),
    apiListLabs(token).catch(() => ({ ok: false as const, data: null })),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Courses" count={coursesRes.data?.length ?? 0}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
        <ImportCoursesDialog />
      </PageHeader>
      {coursesRes.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load courses: {coursesRes.error}
        </p>
      )}
      <CoursesManager
        courses={coursesRes.data ?? []}
        courseTypes={courseTypesRes.data ?? []}
        categories={categoriesRes.data ?? []}
        tags={tagsRes.data ?? []}
        outcomes={outcomesRes.data ?? []}
        highlights={highlightsRes.data ?? []}
        learningPoints={learningPointsRes.data ?? []}
        modules={modulesRes.data ?? []}
        lessons={lessonsRes.data ?? []}
        videos={videosRes.data ?? []}
        drLabs={(drLabsRes.ok ? drLabsRes.data : null) ?? []}
      />
    </div>
  );
}
