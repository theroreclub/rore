import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Boxes,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  Package,
  Shield,
  ShoppingBag,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getRequestSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/90 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="hidden md:flex p-6 border-b border-zinc-800/60 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-950/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white block">
                RORE<span className="text-rose-500">.</span>CONTROL
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-4 md:block md:space-y-1.5 md:p-4 md:flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-rose-500" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
          >
            <Boxes className="w-4 h-4 text-amber-500" />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
          >
            <FolderTree className="w-4 h-4 text-emerald-500" />
            <span>Categories</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
          >
            <Package className="w-4 h-4 text-sky-500" />
            <span>Orders</span>
          </Link>
        </nav>

        {/* Storefront Link & Admin Info */}
        <div className="hidden md:block p-4 border-t border-zinc-800/60 space-y-3">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
              Public Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>

          <div className="px-3 py-2 text-[11px] text-zinc-500 font-mono">
            <span>Signed in as </span>
            <span className="text-zinc-300 font-bold block truncate">
              {session.user.email}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
