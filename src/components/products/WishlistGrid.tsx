"use client";

import Link from "next/link";
import { ProductGrid, type GridProduct } from "./ProductGrid";
import { useWishlist } from "./Wishlist";

export function WishlistGrid({ products }: { products: GridProduct[] }) {
  const wishlist = useWishlist();
  if (wishlist === null) return <p aria-live="polite">Loading wishlist…</p>;
  const ids = new Set(wishlist);
  const saved = products.filter(product => ids.has(product.id));
  if (saved.length) return <ProductGrid products={saved} />;
  return <div className="space-y-4"><p>Tap a heart on a product to save it here.</p>
    <Link className="drop-button drop-button-primary" href="/products">Browse merch</Link></div>;
}
