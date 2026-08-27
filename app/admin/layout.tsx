import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Gate the whole admin area: redirects to SSO when logged out, blocks
  // non-staff accounts, and keeps staff signed in.
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}