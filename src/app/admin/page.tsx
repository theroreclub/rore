import Link from "next/link";
import { ArrowUpRight, Plus, PackageCheck, ShoppingBag } from "lucide-react";
import { getAdminDashboardMetrics } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin overview | RORE CLUB",
  description: "View store revenue, recent orders, and items that need attention.",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const { totalOrders, totalRevenue, pendingShipments, recentOrders, unavailableProducts, unavailableCount } = await getAdminDashboardMetrics();
  return <div className="admin-columns"><section className="admin-primary">
    <header className="admin-heading"><h1>Overview</h1><Link className="admin-button solid" href="/admin/products/new"><Plus size={15}/>New product</Link></header>
    <div className="admin-metrics">{[["Total revenue", formatPrice(totalRevenue)], ["Orders", totalOrders], ["Awaiting dispatch",pendingShipments]].map(([label,value]) =>
      <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="section-heading"><h2>Recent orders</h2><Link className="admin-link" href="/admin/orders">View all <ArrowUpRight size={14}/></Link></div>
    <table className="work-table orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{recentOrders.map(order =>
      <tr key={order.id}><td><Link className="record-link" href={`/admin/orders/${order.id}`}>#{order.id.slice(-8).toUpperCase()}</Link></td><td>{order.user.name || order.user.email}</td>
      <td><span className="status-pill" data-status={order.status}>{order.status.toLowerCase()}</span></td><td className="money">{formatPrice(order.total)}</td></tr>)}</tbody></table>
    {!recentOrders.length && <div className="admin-empty"><ShoppingBag size={23}/><p>No orders yet.</p></div>}
  </section><aside className="admin-rail"><section><h2><PackageCheck size={16}/> Inventory</h2><div className="inventory-total"><strong>{unavailableCount}</strong><span>Unavailable products</span></div>
    {unavailableProducts.length ? <ul className="attention-list">{unavailableProducts.map(p => <li key={p.id}><Link href={`/admin/products/${p.id}/edit`}>{p.name} <ArrowUpRight size={13}/></Link></li>)}</ul> : <p className="rail-note">Every published product has an available variant.</p>}
    <Link className="admin-link" href="/admin/products">Open catalog <ArrowUpRight size={14}/></Link>
  </section></aside></div>;
}
