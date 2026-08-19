import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Audit Log" };

export default function AuditLogSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Audit Log" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Audit log — coming soon.
      </p>
    </div>
  );
}