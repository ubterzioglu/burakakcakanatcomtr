import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdminSnapshot } from "@/lib/site-data";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdminPage();
  const snapshot = await getAdminSnapshot();

  return <AdminDashboard snapshot={snapshot} />;
}
