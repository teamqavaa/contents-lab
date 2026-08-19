import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Permissions" };

export default function PermissionsSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Permissions" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Permissions settings — coming soon.
      </p>
    </div>
  );
}