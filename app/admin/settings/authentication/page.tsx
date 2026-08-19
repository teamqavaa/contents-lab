import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Authentication" };

export default function AuthenticationSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Authentication" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Authentication settings — coming soon.
      </p>
    </div>
  );
}