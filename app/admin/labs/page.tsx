import { PageHeader } from "@/components/admin/PageHeader";
import { LabsManager } from "@/components/admin/LabsManager";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListLabs, apiListSkills } from "@/lib/api/lab-api";

export default async function LabsPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [labsRes, skillsRes] = await Promise.all([
    apiListLabs(token),
    apiListSkills(token),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Labs" count={labsRes.data?.length} />
      {labsRes.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load labs: {labsRes.error}
        </p>
      ) : (
        <LabsManager labs={labsRes.data ?? []} skills={skillsRes.data ?? []} />
      )}
    </div>
  );
}