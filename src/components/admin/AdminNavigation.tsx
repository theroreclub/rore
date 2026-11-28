"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Grid2X2, Layers3, LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";

const sections = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Grid2X2 },
];

export function AdminNavigation({ email }: { email: string }) {
  const path = usePathname();
  const current = sections.find(section => section.href !== "/admin" && path.startsWith(section.href)) ?? sections[0];
  return <>
    <aside className="admin-sidebar">
      <Link href="/admin" aria-label="RORE CLUB admin overview" className="admin-brand"><Layers3 aria-hidden="true" size={26} />RORE CLUB<span>.</span></Link>
      <nav aria-label="Admin navigation">{sections.map(({ href, label, icon: Icon }) =>
        <Link key={href} href={href} aria-current={href === current.href ? "page" : undefined}><Icon size={17} />{label}</Link>
      )}</nav>
      <div className="admin-user"><span className="admin-avatar">RC</span><div><strong>Store admin</strong><small><a href={`mailto:${email}`}>{email}</a></small></div></div>
    </aside>
    <div className="admin-top"><div><Store size={15} /> Workspace <span>/</span> <strong>{current.label}</strong></div>
      <Link href="/">View store <ArrowUpRight size={15} /></Link>
    </div>
  </>;
}
