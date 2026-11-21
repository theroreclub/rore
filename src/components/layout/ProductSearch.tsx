"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { inr, productPath, type Product } from "@/lib/catalog";

export function ProductSearch({
  products,
  close,
}: {
  products: Product[];
  close: () => void;
}) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = products.filter((p) => {
    const text = [
      p.name,
      p.kind,
      p.universe,
      p.color,
      p.kind === "Tees" ? "t-shirt tshirt t shirt" : "",
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  return (
    <>
      <h2 id="panel-title">Search the collection</h2>
      <label className="rc-label" htmlFor="rc-search">
        Product, colour, or universe
      </label>
      <div className="rc-search-field">
        <Search size={18} aria-hidden />
        <input
          ref={input}
          id="rc-search"
          className="rc-input"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a tee or hoodie"
        />
      </div>
      <p className="rc-result-count" role="status">
        {matches.length} {matches.length === 1 ? "piece" : "pieces"}
      </p>
      {matches.length ? (
        <ul className="rc-results">
          {matches.map((p) => (
            <li key={p.id}>
              <Link href={productPath(p)} onNavigate={close}>
                <span>
                  {p.name}
                  <small>
                    {p.universe} / {p.color}
                  </small>
                </span>
                <span>{inr(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rc-no-results">
          <p>No pieces match this search.</p>
          <button
            className="rc-button"
            data-tone="quiet"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
