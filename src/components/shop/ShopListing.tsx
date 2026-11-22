"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { ProductGrid } from "./ProductGrid";
import { sizes, type Product } from "@/lib/catalog";

export function ShopListing({ products }: { products: Product[] }) {
  const params = useSearchParams(),
    path = usePathname();
  const categories = ["Tees", "Hoodies"],
    colors = [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))];
  const allowed = (key: string, values: readonly string[]) => {
    const v = params.get(key) || "";
    return values.includes(v) ? v : "";
  };
  const category = allowed("category", categories),
    color = allowed("color", colors),
    size = allowed("size", sizes),
    sort = allowed("sort", ["price-asc", "price-desc", "name"]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    window.history.pushState(
      null,
      "",
      path + (next.size ? "?" + next.toString() : ""),
    );
  }
  const filtered = products.filter(
    (p) =>
      (!category || p.kind === category) &&
      p.variants.some(
        (v) => (!color || v.color === color) && (!size || v.label === size),
      ),
  );
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort)
    filtered.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : b.price - a.price,
    );
  const summary = useRef<HTMLParagraphElement>(null);
  const hasFilters = Boolean(category || size || color || sort);
  function reset() {
    window.history.pushState(null, "", path);
    summary.current?.focus();
  }
  return (
    <main className="atelier atelier-wrap shop-view">
      <p className="eyebrow">RORECLUB / Collection</p>
      <h1>Shop the collection.</h1>
      <div className="shop-controls">
        <fieldset className="category-tabs">
          <legend className="sr-only">Category</legend>
          {["", ...categories].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => update("category", c)}
            >
              {c === "Tees" ? "T-shirts" : c || "All pieces"}
            </button>
          ))}
        </fieldset>
        <div className="select-row">
          {[
            { label: "Size", key: "size", value: size, options: sizes },
            { label: "Colour", key: "color", value: color, options: colors },
          ].map((f) => (
            <label key={f.key}>
              {f.label}
              <select
                value={f.value}
                onChange={(e) => update(f.key, e.target.value)}
              >
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            Sort by
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
      </div>
      <div className="results-heading">
        <p ref={summary} tabIndex={-1} role="status">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </p>
        {hasFilters && (
          <button className="text-link" onClick={reset}>
            Clear filters
          </button>
        )}
      </div>
      {filtered.length ? (
        <ProductGrid products={filtered} />
      ) : (
        <div className="empty-state">
          <h2>No pieces in this edit.</h2>
          <p>Try another colour or size to see more of the collection.</p>
          <button className="rc-button" onClick={reset}>
            Show all pieces
          </button>
        </div>
      )}
    </main>
  );
}
