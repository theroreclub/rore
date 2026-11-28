import { publicProducts, publicCategories } from "@/lib/public-catalog";
import { Suspense } from "react";
import { productSearchParamsSchema } from "@/lib/validations/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { WishlistGrid } from "@/components/products/WishlistGrid";
import { ProductFilter } from "@/components/products/ProductFilter";

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
  const [catalog, categories] = await Promise.all([publicProducts(), publicCategories()]);
  const term = search?.toLowerCase();
  const products = catalog.filter(product =>
    (!category || category === product.category.slug) &&
    (!term || product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term))
  );
  if (sort !== "newest") {
    const direction = sort === "price_asc" ? 1 : -1;
    products.sort((a, b) => direction * (a.price - b.price) || a.name.localeCompare(b.name));
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
