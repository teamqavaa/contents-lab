import { QuizzesManager } from "@/components/admin/QuizzesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import {
  optionsApi,
  questionsApi,
  quizzesApi,
  quizTypesApi,
} from "@/lib/api/courses-api";

export default async function QuizzesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [quizzesRes, quizTypesRes, questionsRes, optionsRes] = await Promise.all([
    quizzesApi.list(token),
    quizTypesApi.list(token),
    questionsApi.list(token),
    optionsApi.list(token),
  ]);
  const quizzes = quizzesRes.data ?? [];
  const quizTypes = quizTypesRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const options = optionsRes.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Quizzes" count={quizzes.length}>
        <span className="text-xs text-muted-foreground">
          Content served by the courses API
        </span>
      </PageHeader>
      {quizzesRes.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load quizzes: {quizzesRes.error}
        </p>
      ) : (
        <QuizzesManager
          quizzes={quizzes}
          quizTypes={quizTypes}
          questions={questions}
          options={options}
        />
      )}
    </div>
  );
}