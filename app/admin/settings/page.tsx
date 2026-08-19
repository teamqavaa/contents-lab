import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsGroup, SettingsRow } from "@/components/admin/SettingsRow";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Settings" />

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <SettingsGroup title="Platform">
          <SettingsRow href="/admin/settings/general" label="General" />
          <SettingsRow href="/admin/settings/appearance" label="Appearance" />
          <SettingsRow
            href="/admin/settings/email-notifications"
            label="Email Notifications"
          />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsRow
            href="/admin/settings/authentication"
            label="Authentication"
          />
          <SettingsRow
            href="/admin/settings/permissions"
            label="Permissions"
          />
          <SettingsRow href="/admin/settings/audit-log" label="Audit Log" />
        </SettingsGroup>
      </div>
    </div>
  );
}