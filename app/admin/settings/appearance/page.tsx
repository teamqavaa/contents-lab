import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Appearance" };

export default function AppearanceSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Appearance" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Appearance settings — coming soon.
      </p>
    </div>
  );
}