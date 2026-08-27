import { QuizzesManager } from "@/components/admin/QuizzesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { quizzesApi } from "@/lib/api/courses-api";

export default async function QuizzesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const { data: quizzes, error } = await quizzesApi.list(token);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Quizzes" count={quizzes?.length}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
      </PageHeader>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load quizzes: {error}
        </p>
      ) : (
        <QuizzesManager quizzes={quizzes ?? []} />
      )}
    </div>
  );
}