import { StatCard } from "@/components/admin/StatCard";
import { getAdminToken, requireAdmin } from "@/lib/admin-auth";
import { apiListLabs, apiListSkills, apiListUsers } from "@/lib/api/lab-api";

export default async function AdminHomePage() {
  await requireAdmin();
  const token = await getAdminToken();
  const [skillsRes, labsRes, usersRes] = await Promise.all([
    apiListSkills(token),
    apiListLabs(token),
    apiListUsers(token),
  ]);

  const adminStats = [
    { label: "Total Users", value: usersRes.data?.length ?? 0 },
    { label: "Labs", value: labsRes.data?.length ?? 0 },
    { label: "Skills", value: skillsRes.data?.length ?? 0 },
    {
      label: "Published labs",
      value: (labsRes.data ?? []).filter((lab) => lab.status === "published").length,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, labs, skills, and platform content.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Select a section from the sidebar to begin managing platform content.
      </p>
    </div>
  );
}