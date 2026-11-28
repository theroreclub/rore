import { redirect } from "next/navigation";
import { getRequestSession } from "@/lib/auth-checks";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import "./workspace.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getRequestSession();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return <div className="admin-shell">
    <AdminNavigation email={session.user.email || ""} />
    <div className="admin-workspace">{children}</div>
  </div>;
}
