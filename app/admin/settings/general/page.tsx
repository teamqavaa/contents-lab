import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "General" };

export default function GeneralSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="General" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        General settings — coming soon.
      </p>
    </div>
  );
}