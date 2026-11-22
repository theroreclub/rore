"use client";
import { useShop } from "../layout/Storefront";
import ProductCard from "../ProductCard";
import type { Product } from "@/lib/catalog";
export function ProductGrid({ products }: { products: Product[] }) {
  const { saved, toggleSaved } = useShop();
  return (
    <div className="product-grid atelier-grid">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          saved={saved.includes(p.id)}
          onSave={() => toggleSaved(p.id)}
        />
      ))}
    </div>
  );
}
