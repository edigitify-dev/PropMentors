import { requireAdmin } from "@/lib/admin-auth";
import { database } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const { rows } = await database().query("SELECT count(*)::int AS count FROM enquiries WHERE status='new'");
  return <AdminShell admin={admin} unread={rows[0].count}>{children}</AdminShell>;
}
