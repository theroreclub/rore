import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { getAdminOrders } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { SummaryRing } from "@/components/admin/SummaryRing";

const labels: Record<OrderStatus, string> = { PENDING:"Pending", PAID:"Paid", SHIPPED:"Shipped", DELIVERED:"Delivered", CANCELLED:"Cancelled" };
const statuses = Object.values(OrderStatus);
function ordersUrl(status: string, page = 1) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return "/admin/orders" + (params.size ? "?" + params : "");
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status = statuses.includes(params.status as OrderStatus) ? params.status as OrderStatus : "";
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.page)) || 1));
  const { orders, counts, totalCount, totalPages } = await getAdminOrders({ status, page, limit: 10 });
  if (page > Math.max(1,totalPages)) redirect(ordersUrl(status, Math.max(1,totalPages)));
  const count = (key: OrderStatus) => counts.find(group => group.status === key)?._count ?? 0;
  const all = counts.reduce((sum, group) => sum + group._count, 0);
  return <div className="admin-columns"><section className="admin-primary">
    <header className="admin-heading"><h1>Orders <small>{all}</small></h1></header>
    <nav className="admin-tabs" aria-label="Order status">{(["", ...statuses] as const).map(key =>
      <Link key={key} aria-current={status === key ? "page" : undefined} href={ordersUrl(key)}>{key ? labels[key] : "All orders"}</Link>)}</nav>
    <table className="work-table orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Placed</th></tr></thead>
      <tbody>{orders.map(order => {
        const number = "#" + order.id.slice(-8).toUpperCase();
        const placed = order.createdAt.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", timeZone:"Asia/Kolkata" });
        return <tr key={order.id}><td><DetailDrawer section="Order details" title={"Order " + number} className="record-link" trigger={number}>
          <span className="status-pill" data-status={order.status}>{labels[order.status]}</span>
          <h3>Order items</h3><ul className="drawer-items">{order.orderItems.map(item =>
            <li key={item.id}><div><strong>{item.product.name}</strong><small>{item.variant}</small></div><span>{item.quantity} × {formatPrice(item.priceAtPurchase)}</span></li>)}</ul>
          <dl className="admin-facts"><dt>Total</dt><dd>{formatPrice(order.total)}</dd><dt>Placed</dt><dd>{placed}</dd>
            <dt>Customer</dt><dd>{order.user.name || "Customer"}</dd><dt>Email</dt><dd>{order.user.email}</dd>
            <dt>Payment reference</dt><dd>{order.paymentId || order.razorpayOrderId || "Pending"}</dd></dl>
          <Link className="admin-button solid" href={`/admin/orders/${order.id}`}>Manage order <ArrowUpRight size={15}/></Link>
        </DetailDrawer></td><td>{order.user.name || order.user.email}</td><td><span className="status-pill" data-status={order.status}>{labels[order.status]}</span></td>
        <td className="money">{formatPrice(order.total)}</td><td>{placed}</td></tr>;
      })}</tbody></table>
    {!orders.length && <div className="admin-empty"><ShoppingBag size={23} /><p>{status ? "No orders with this status." : "No orders yet."}</p></div>}
    <footer className="work-pagination"><span>{totalCount} {totalCount === 1 ? "order" : "orders"} · Page {page} of {Math.max(1,totalPages)}</span>
      {page > 1 && <Link href={ordersUrl(status,page-1)}>← Previous</Link>}{page < totalPages && <Link href={ordersUrl(status,page+1)}>Next →</Link>}</footer>
    </section><aside className="admin-rail"><section><h2><ShoppingBag size={15}/>Fulfillment overview</h2>
      <SummaryRing value={count("DELIVERED")} total={all} label="delivered"/>
      <dl className="rail-values"><dt>All orders</dt><dd>{all}</dd><dt>Awaiting dispatch</dt><dd>{count("PAID")}</dd></dl>
    </section><section><h2>Order status</h2>{statuses.map(key => <div key={key} className="category-meter"><div><span>{labels[key]}</span><strong>{count(key)}</strong></div><progress value={count(key)} max={all || 1} aria-label={labels[key]} /></div>)}</section></aside>
  </div>;
}
