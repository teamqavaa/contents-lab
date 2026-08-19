import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Email Notifications" };

export default function EmailNotificationsSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Email Notifications" />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Email notification settings — coming soon.
      </p>
    </div>
  );
}