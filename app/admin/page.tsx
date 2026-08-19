import { StatCard } from "@/components/admin/StatCard";
import { adminStats } from "@/lib/admin-data";

export default function AdminHomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, courses, and platform content.
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