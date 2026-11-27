import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { productSearchParamsSchema } from "@/lib/validations/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { WishlistGrid } from "@/components/products/WishlistGrid";
import { ProductFilter } from "@/components/products/ProductFilter";
import { Prisma } from "@prisma/client";
import { previewCategories, previewProducts } from "@/lib/preview-catalog";
import { getAvailableVariants } from "@/lib/validations/variants";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15+ App Router
  const rawParams = await searchParams;

  // Validate parameters with Zod on the server
  const parsedParams = productSearchParamsSchema.safeParse({
    category: typeof rawParams.category === "string" ? rawParams.category : undefined,
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
  });

  const { category, search } = parsedParams.success
    ? parsedParams.data
    : { category: undefined, search: undefined };
  const sort = rawParams.sort === "price_asc" || rawParams.sort === "price_desc"
    ? rawParams.sort : "newest";
  const priceSort = sort === "price_asc" ? "asc" : "desc";

  // Build the Prisma where condition
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let products: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    regularPrice?: number | null;
    stock: number;
    images: string[];
    category: { name: string; slug: string } | null;
  }> = [];

  let categories: Array<{
    id: string;
    name: string;
    slug: string;
  }> = [];

  try {
    if (!process.env.DATABASE_URL) {
      products = previewProducts.filter((product) =>
        (!category || product.category.slug === category) &&
        (!search || `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()))
      );
      if (sort !== "newest") {
        products.sort((a, b) => priceSort === "asc" ? a.price - b.price : b.price - a.price);
      }
      categories = previewCategories;
    } else {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: sort === "newest" ? { createdAt: "desc" } : [{ price: priceSort }, { name: "asc" }],
          include: {
            category: { select: { name: true, slug: true } },
          },
        }),
        prisma.category.findMany({
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        }),
      ]);

      products = fetchedProducts.map((product) => ({
        ...product, stock: getAvailableVariants(product.qikinkVariants).length ? 20 : 0,
      }));
      categories = fetchedCategories;
    }
  } catch (error) {
    console.error("Failed to query products from database:", error);
  }

  // Active Category Name for title
  const activeCategoryObj = categories.find((c) => c.slug === category);
  if (rawParams.wishlist === "1") {
    const cards = products.map(({ id, name, slug, price, regularPrice, stock, images, category }) => ({
      id, name, slug, price, regularPrice, stock, images, category,
    }));
    return <div className="store-shell py-8 sm:py-12 space-y-8">
      <h1 className="display-type text-5xl uppercase sm:text-7xl">Wishlist</h1>
      <WishlistGrid products={cards} />
    </div>;
  }

  return (
    <div className="store-shell py-8 sm:py-12 space-y-8">
      {/* Catalog Title Banner */}
      <div className="space-y-2">
        <h1 className="display-type text-5xl uppercase sm:text-7xl">
          {activeCategoryObj ? activeCategoryObj.name : "All merch"}
        </h1>
        <p className="text-sm text-text-secondary max-w-xl">
          Anime-inspired tees, graphic hoodies, and accessories printed to order.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <Suspense fallback={null}>
        <ProductFilter
          categories={categories}
          currentCategory={category}
          currentSearch={search}
          currentSort={sort}
        />
      </Suspense>

      {/* Products Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mb-4">
          <span>SHOWING {products.length} {products.length === 1 ? "PIECE" : "PIECES"}</span>
          {search && (
            <span>
              FILTERED BY: &ldquo;{search}&rdquo;
            </span>
          )}
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
