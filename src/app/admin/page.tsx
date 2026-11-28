import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { getAdminDashboardMetrics } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Truck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Package,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getRequestSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const {
    totalOrders,
    totalRevenue,
    pendingShipments,
    unavailableCount,
    recentOrders,
    unavailableProducts,
  } = await getAdminDashboardMetrics();

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
            MISSION CONTROL // OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            RORE CLUB Admin
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time catalog metrics, revenue analytics, and fulfillment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Drop</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Across paid and delivered orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{totalOrders}</div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Lifetime orders placed</p>
        </div>

        {/* Pending Shipments */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Pending Shipments
            </span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{pendingShipments}</div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Paid orders waiting for dispatch
          </p>
        </div>

        {/* Low Stock Items */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Unavailable products
            </span>
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{unavailableCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Live products with no available variants</p>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Recent Orders
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                Latest customer purchases in the system
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono font-bold uppercase transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 font-mono">
              No orders have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-6">Order</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-zinc-400">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">
                          {order.user.name || "Customer"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {order.user.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            order.status === "PAID"
                              ? "success"
                              : order.status === "SHIPPED"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] font-mono"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-mono text-zinc-400 hover:text-white"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Items (1 col) */}
        <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Unavailable products
              </h3>
            </div>
            <Link
              href="/admin/products"
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              All Drops
            </Link>
          </div>

          {unavailableProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">
              All live products have an available variant.
            </div>
          ) : (
            <div className="space-y-3">
              {unavailableProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs font-bold text-white hover:text-rose-400 transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {formatPrice(p.price)}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-400 font-mono text-xs font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Unavailable</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
