import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { getAdminOrders } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Filter } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

const STATUS_FILTERS = [
  { label: "All Orders", value: "ALL" },
  { label: "Paid", value: OrderStatus.PAID },
  { label: "Shipped", value: OrderStatus.SHIPPED },
  { label: "Delivered", value: OrderStatus.DELIVERED },
  { label: "Pending", value: OrderStatus.PENDING },
  { label: "Cancelled", value: OrderStatus.CANCELLED },
];

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PAID:
      return <Badge variant="success">Paid</Badge>;
    case OrderStatus.SHIPPED:
      return <Badge variant="warning">Shipped</Badge>;
    case OrderStatus.DELIVERED:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono">
          Delivered
        </span>
      );
    case OrderStatus.PENDING:
      return <Badge variant="secondary">Pending</Badge>;
    case OrderStatus.CANCELLED:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-800/80 text-rose-400 font-mono">
          Cancelled
        </span>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const session = await getRequestSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { status, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const { orders, totalCount, totalPages } = await getAdminOrders({
    status,
    page: currentPage,
    limit: 10,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
          FULFILLMENT // COMMERCE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
          Orders & Dispatches
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Track customer purchases, fulfill shipments, and manage order lifecycles.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Filter className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
        {STATUS_FILTERS.map((f) => {
          const isActive = (!status && f.value === "ALL") || status === f.value;
          return (
            <Link
              key={f.value}
              href={`/admin/orders${f.value === "ALL" ? "" : `?status=${f.value}`}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-zinc-950 font-black shadow-md"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">No orders found matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono text-zinc-400 font-bold">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-rose-400 transition-colors"
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-white block">
                            {order.user.name || "Customer"}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500 block">
                            {order.user.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-zinc-400">{dateStr}</td>

                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {formatPrice(order.total)}
                      </td>

                      <td className="py-4 px-4">{getStatusBadge(order.status)}</td>

                      <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">
                        {order.paymentId ? (
                          <span className="text-emerald-400 block truncate max-w-[120px]" title={order.paymentId}>
                            {order.paymentId}
                          </span>
                        ) : order.razorpayOrderId ? (
                          <span className="text-zinc-500 truncate max-w-[120px] block" title={order.razorpayOrderId}>
                            {order.razorpayOrderId}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-mono font-bold"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>
              Page {currentPage} of {totalPages} ({totalCount} total orders)
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/orders?page=${currentPage - 1}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  &larr; Prev
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/orders?page=${currentPage + 1}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
