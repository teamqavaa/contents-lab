import { PageHeader } from "@/components/admin/PageHeader";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListSkills } from "@/lib/api/lab-api";

export default async function SkillsPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const { data: skills, error } = await apiListSkills(token);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Skills" count={skills?.length}>
        <span className="text-xs text-muted-foreground">Skills power the lab tracks</span>
      </PageHeader>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load skills: {error}
        </p>
      ) : (
        <SkillsManager skills={skills ?? []} />
      )}
    </div>
  );
}