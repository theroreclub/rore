import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminProductRowActions } from "@/components/admin/AdminProductRowActions";
import Image from "next/image";
import Form from "next/form";
import Link from "next/link";
import { Plus, Search, Upload, RefreshCw, Layers3 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { QikinkStockReport } from "@/components/admin/QikinkStockReport";
import { QikinkCatalogImport } from "@/components/admin/QikinkCatalogImport";
import { getVariants } from "@/lib/validations/variants";

import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { SummaryRing } from "@/components/admin/SummaryRing";

type Filters = { search?: string; category?: string; status?: string; page?: string };

export const metadata = {
  title: "Product catalog · Admin | RORE CLUB",
  description: "Manage products, prices, photos, and Qikink imports.",
  robots: { index: false },
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const session = await getRequestSession();
  if (session?.user.role !== "ADMIN") redirect("/");
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 120) : "";
  const category = typeof params.category === "string" && params.category !== "ALL" ? params.category : "";
  const status = params.status === "live" || params.status === "hidden" ? params.status : "";
  const currentPage = Math.min(100000, Math.max(1, Math.floor(Number(params.page)) || 1));
  const limit = 10;
  const scope: Prisma.ProductWhereInput = {};
  if (category) scope.category = { slug: category };
  if (search) scope.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { slug: { contains: search, mode: "insensitive" } },
    { qikinkProductId: { contains: search } },
  ];
  const where = status ? { ...scope, isActive: status === "live" } : scope;
  const [products, counts, categories] = await Promise.all([
    prisma.product.findMany({
      where, take: limit, skip: (currentPage - 1) * limit,
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      select: { id: true, name: true, price: true, regularPrice: true, isActive: true, images: true,
        qikinkProductId: true, qikinkVariants: true, description: true, updatedAt: true, category: { select: { name: true } } },
    }),
    prisma.product.groupBy({ by: ["isActive", "categoryId"], where: scope, _count: true }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);
  const live = counts.reduce((sum, row) => sum + (row.isActive ? row._count : 0), 0);
  const hidden = counts.reduce((sum, row) => sum + (row.isActive ? 0 : row._count), 0);
  const total = status === "live" ? live : status === "hidden" ? hidden : live + hidden;
  const pages = Math.max(1, Math.ceil(total / limit));
  function listUrl(nextStatus: string, page = 1) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (nextStatus) query.set("status", nextStatus);
    if (page > 1) query.set("page", String(page));
    return "/admin/products" + (query.size ? "?" + query.toString() : "");
  }
  if (currentPage > pages) redirect(listUrl(status, pages));
  const matched = live + hidden;
  return <div className="admin-columns">
    <section className="admin-primary">
      <header className="admin-heading"><h1>Products <small>{matched}</small></h1>
        <div className="admin-buttons">
          <DetailDrawer title="Import Qikink designs" section="Catalog import" trigger={<><Upload size={15} />Import CSV</>}><QikinkCatalogImport categories={categories} /></DetailDrawer>
          <Link className="admin-button solid" href="/admin/products/new"><Plus size={15} />New product</Link>
        </div>
      </header>
      <nav aria-label="Publication status" className="admin-tabs">{([["", "All products", matched], ["live","Live",live], ["hidden","Unpublished",hidden]] as const).map(([value, label, count]) =>
        <Link key={label} aria-current={status === value ? "page" : undefined} href={listUrl(value)}>{label}<small>{count}</small></Link>)}</nav>
      <Form key={listUrl(status)} className="admin-filters" action="/admin/products">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="admin-search"><Search size={16} /><input aria-label="Search products" type="search" name="search" defaultValue={search} placeholder="Search name, slug or Qikink ID" /></label>
        <select name="category" defaultValue={category} aria-label="Category"><option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
        <button className="admin-button">Apply</button>
        {(search || category || status) && <Link className="admin-link" href="/admin/products">Clear filters</Link>}
      </Form>
      <table className="work-table products-table">
        <thead><tr><th>Product</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>{products.map(p => {
          const options = getVariants(p.qikinkVariants);
          const available = options.filter(v => !v.unavailable).length;
          const missing = [!p.images.length && "photo", p.description.trim().length < 10 && "description", !p.price && "price", !options.length && "Store SKUs"].filter(Boolean);
          return <tr key={p.id}>
            <td><div className="product-cell"><div className="admin-thumb"><Image fill sizes="44px" src={p.images[0] || "/images/products/placeholder.svg"} alt="" /></div>
              <div><DetailDrawer title={p.name} section="Product details" className="record-link" trigger={p.name}>
                <div className="drawer-product"><Image width={160} height={160} alt={p.name} src={p.images[0] || "/images/products/placeholder.svg"} /></div>
                <dl className="admin-facts">
                  <dt>Status</dt><dd>{p.isActive ? "Live" : "Unpublished"}</dd><dt>Category</dt><dd>{p.category.name}</dd>
                  <dt>Price</dt><dd>{formatPrice(p.price)} {p.regularPrice ? <del>{formatPrice(p.regularPrice)}</del> : null}</dd>
                  <dt>Qikink product ID</dt><dd>{p.qikinkProductId || "Unlinked"}</dd><dt>Available variants</dt><dd>{available} of {options.length}</dd>
                  <dt>Photos</dt><dd>{p.images.length}</dd><dt>Last updated</dt><dd>{p.updatedAt.toLocaleDateString("en-IN", { dateStyle:"medium", timeZone:"Asia/Kolkata" })}</dd>
                  {missing.length > 0 && <><dt>Missing</dt><dd>{missing.join(", ")}</dd></>}
                </dl>
                <AdminProductRowActions productId={p.id} productName={p.name} isActive={p.isActive} />
              </DetailDrawer><small>{p.category.name}</small></div></div></td>
            <td><span className="status-pill" data-live={p.isActive}>{p.isActive ? "Live" : "Unpublished"}</span></td>
            <td className="money">{p.price ? formatPrice(p.price) : "Price needed"}</td>
            <td><AdminProductRowActions productId={p.id} productName={p.name} isActive={p.isActive} /></td>
          </tr>;
        })}</tbody>
      </table>
      {!products.length && <p className="admin-empty">No products match these filters.</p>}
      <footer className="work-pagination"><span>{total ? `${(currentPage-1)*limit + 1}–${Math.min(currentPage*limit,total)} of ${total} products` : "0 products"}</span>
        {currentPage > 1 && <Link href={listUrl(status,currentPage-1)}>← Previous</Link>}
        {currentPage < pages && <Link href={listUrl(status,currentPage+1)}>Next →</Link>}</footer>
    </section>
    <aside className="admin-rail" aria-label="Catalog overview">
      <section><h2><Layers3 size={15} />Catalog overview</h2>
        <SummaryRing value={live} total={matched} label="published" />
        <dl className="rail-values"><dt><i className="green-dot" />Live</dt><dd>{live}</dd><dt><i />Unpublished</dt><dd>{hidden}</dd></dl>
      </section>
      <section><h2>By category</h2>{categories.map(c => {
        const n = counts.reduce((sum,row) => sum + (row.categoryId === c.id ? row._count : 0),0);
        return <div className="category-meter" key={c.id}><div><span>{c.name}</span><strong>{n}</strong></div><progress value={n} max={matched || 1} aria-label={c.name} /></div>;
      })}</section>
      <section><h2>Qikink inventory</h2><DetailDrawer section="Qikink inventory" title="Update availability" trigger={<><RefreshCw size={14} />Update stock report</>}><QikinkStockReport /></DetailDrawer></section>
    </aside>
  </div>;
}
