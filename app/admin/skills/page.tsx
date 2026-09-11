import { PageHeader } from "@/components/admin/PageHeader";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListLabs, apiListSkills } from "@/lib/api/lab-api";

export default async function SkillsPage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [skillsRes, labsRes] = await Promise.all([
    apiListSkills(token),
    apiListLabs(token),
  ]);
  const skills = skillsRes.data ?? [];
  const labs = labsRes.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Skills" count={skills.length}>
        <span className="text-xs text-muted-foreground">Skills power the lab tracks</span>
      </PageHeader>
      {skillsRes.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Could not load skills: {skillsRes.error}
        </p>
      ) : (
        <SkillsManager skills={skills} labs={labs} />
      )}
    </div>
  );
}
