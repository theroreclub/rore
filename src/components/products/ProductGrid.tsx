import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

export interface GridProduct {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    regularPrice?: number | null;
    stock: number;
    images: string[];
    category?: {
      name: string;
      slug: string;
    } | null;
}

export function ProductGrid({ products }: { products: GridProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center py-20 px-6 text-center rounded-md max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-shop-muted mb-4">
          <PackageOpen className="w-8 h-8 text-shop-wine" />
        </div>
        <h3 className="text-lg font-bold text-shop-ink tracking-wide uppercase">No Drops Found</h3>
        <p className="text-xs text-shop-muted mt-2 leading-relaxed">
          We couldn&apos;t find any drops matching your active filters. Try adjusting your search term or exploring all collections.
        </p>
        <Link
          href="/products"
          className="mt-6 px-6 py-2.5 rounded-full bg-shop-wine text-shop-ivory hover:bg-[#41151b] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
        >
          Reset Filters
        </Link>
      </div>
    );
  }

  return (
    <div className="merch-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
