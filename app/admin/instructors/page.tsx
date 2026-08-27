import { PageHeader } from "@/components/admin/PageHeader";
import { UsersManager } from "@/components/admin/UsersManager";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListUsers } from "@/lib/api/lab-api";

export default async function InstructorsPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const { data: users, error } = await apiListUsers(token, "instructor");

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Instructors" count={users?.length} />
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load instructors: {error}
        </p>
      ) : (
        <UsersManager users={users ?? []} />
      )}
    </div>
  );
}