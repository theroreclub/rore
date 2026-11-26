import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminProductRowActions } from "@/components/admin/AdminProductRowActions";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Boxes, Plus, Search } from "lucide-react";
import { Prisma } from "@prisma/client";
import { QikinkStockReport } from "@/components/admin/QikinkStockReport";
import { getVariants } from "@/lib/validations/variants";

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { search, category, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category && category !== "ALL") {
    where.category = { slug: category };
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
            CATALOG // INVENTORY CONTROL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            Products & Drops
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage streetwear silhouettes, pricing, stock levels, and publication status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      <QikinkStockReport />
      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search drops by title or slug..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Link
            href="/admin/products"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              !category || category === "ALL"
                ? "bg-rose-600 text-white"
                : "bg-zinc-950 text-zinc-400 hover:text-white"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/products?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                category === c.slug
                  ? "bg-rose-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Boxes className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">No products match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {products.map((p) => {
                  const isLowStock = p.stock < 5;
                  const variants = getVariants(p.qikinkVariants);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                            <Image
                              src={p.images[0] || "/images/products/vintage-boxy-tee.svg"}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-white hover:text-rose-400 transition-colors block"
                            >
                              {p.name}
                            </Link>
                            <span className="font-mono text-[11px] text-zinc-500 block">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {p.category.name}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-4 px-4">
                        {variants.length ? (
                          <span>{variants.filter(option => !option.unavailable).length} of {variants.length} variants available</span>
                        ) : isLowStock ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 font-mono font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{p.stock} Units</span>
                          </div>
                        ) : (
                          <span className="font-mono text-zinc-300 font-bold">
                            {p.stock}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <Badge
                          variant={p.isActive ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.isActive ? "Active" : "Archived"}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <AdminProductRowActions
                          productId={p.id}
                          productName={p.name}
                          isActive={p.isActive}
                        />
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
              Showing Page {currentPage} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/products?page=${currentPage - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  &larr; Prev
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/products?page=${currentPage + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
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
