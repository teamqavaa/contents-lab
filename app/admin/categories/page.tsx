import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { courseTypesApi } from "@/lib/api/courses-api";

export default async function CategoriesPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const { data: categories, error } = await courseTypesApi.list(token);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Categories" count={categories?.length}>
        <span className="text-xs text-muted-foreground">
          Course types served by the courses API
        </span>
      </PageHeader>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load categories: {error}
        </p>
      ) : (
        <CategoriesManager categories={categories ?? []} />
      )}
    </div>
  );
}