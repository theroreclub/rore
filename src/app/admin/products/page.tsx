import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminProductRowActions } from "@/components/admin/AdminProductRowActions";
import Image from "next/image";
import Form from "next/form";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { QikinkStockReport } from "@/components/admin/QikinkStockReport";
import { QikinkCatalogImport } from "@/components/admin/QikinkCatalogImport";
import { getVariants } from "@/lib/validations/variants";

type Filters = { search?: string; category?: string; status?: string; page?: string };

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
    prisma.product.groupBy({ by: ["isActive"], where: scope, _count: true }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);
  const live = counts.find(row => row.isActive)?._count ?? 0;
  const hidden = counts.find(row => !row.isActive)?._count ?? 0;
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
  const inputStyle = "min-h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm";
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-bold">Products</h1>
      <Link className="flex items-center gap-2 rounded-lg bg-[#fff0dc] px-4 py-2.5 text-sm font-bold text-[#431017]" href="/admin/products/new"><Plus size={16} />New product</Link>
    </header>
    <div className="grid gap-2 xl:grid-cols-2"><QikinkCatalogImport categories={categories} /><QikinkStockReport /></div>
    <Form key={listUrl(status)} className="flex flex-wrap items-end gap-3" action="/admin/products">
      {status && <input type="hidden" name="status" value={status} />}
      <label className="grid min-w-0 flex-1 gap-1 text-xs text-zinc-300">Search products
        <input type="search" name="search" defaultValue={search} placeholder="Name, slug or Qikink ID" className={inputStyle} />
      </label>
      <label className="grid gap-1 text-xs text-zinc-300">Category
        <select name="category" defaultValue={category} className={inputStyle}>
          <option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <button className={inputStyle}>Apply</button>
      {(search || category || status) && <Link href="/admin/products" className="py-2 text-sm underline">Clear filters</Link>}
    </Form>
    <nav aria-label="Publication status" className="flex flex-wrap gap-2">
      {([["", "All", live + hidden], ["live", "Live", live], ["hidden", "Unpublished", hidden]] as const).map(([value, name, count]) =>
        <Link key={name} href={listUrl(value)} aria-current={status === value ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm ${status === value ? "bg-[#fff0dc] text-[#431017]" : "bg-zinc-900 text-zinc-300"}`}>{name} · {count}</Link>
      )}
    </nav>
    <div className="space-y-3">
      {!products.length && <p className="py-8 text-zinc-400">No products match these filters.</p>}
      {products.map(p => {
        const options = getVariants(p.qikinkVariants);
        const missing = [!p.images.length && "photo", p.description.trim().length < 10 && "description", !p.price && "price", !options.length && "Store SKUs"].filter(Boolean);
        return <article key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
              <Image alt="" fill sizes="64px" className="object-cover" src={p.images[0] || "/images/products/placeholder.svg"} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/products/${p.id}/edit`} className="break-words text-lg font-semibold hover:underline">{p.name}</Link>
                <span className={p.isActive ? "text-sm text-emerald-300" : "text-sm text-zinc-400"}>{p.isActive ? "Live" : "Unpublished"}</span>
              </div>
              <p className="text-sm text-zinc-400">{p.category.name}{p.qikinkProductId && ` · Qikink #${p.qikinkProductId}`}</p>
              <p className="mt-1 font-semibold">{p.price ? formatPrice(p.price) : "Price needed"} {p.regularPrice && <del className="text-sm font-normal text-zinc-400">{formatPrice(p.regularPrice)}</del>}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-300">{options.filter(v => !v.unavailable).length} of {options.length} variants available · {p.images.length} {p.images.length === 1 ? "photo" : "photos"}</p>
          {missing.length > 0 && <p className="mt-1 text-sm text-amber-300">Missing {missing.join(", ")}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
            <AdminProductRowActions productId={p.id} productName={p.name} isActive={p.isActive} />
            <small className="text-zinc-400">Updated {p.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</small>
          </div>
        </article>;
      })}
    </div>
    {pages > 1 && <nav aria-label="Product pages" className="flex items-center justify-between gap-3 text-sm">
      {currentPage > 1 ? <Link href={listUrl(status, currentPage - 1)}>← Previous</Link> : <span />}
      <span>Page {currentPage} of {pages}</span>
      {currentPage < pages ? <Link href={listUrl(status, currentPage + 1)}>Next →</Link> : <span />}
    </nav>}
  </div>;
}
