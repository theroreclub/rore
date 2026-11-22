"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Bookmark, Check } from "lucide-react";
import { inr, type Product } from "@/lib/catalog";
import { useShop } from "./layout/Storefront";
import { Gallery } from "./product/Gallery";
import { SizeGuide } from "./product/SizeGuide";
import { ProductGrid } from "./shop/ProductGrid";
export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { saved, toggleSaved, addPiece } = useShop();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  if (product.archived)
    return (
      <main className="atelier atelier-wrap shop-view">
        <p className="eyebrow">Archive</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <Link className="text-link" href="/shop/">
          Explore the current collection
        </Link>
      </main>
    );
  const variants = product.variants.filter((v) => v.color === color.name);
  function add() {
    const v = variants.find((v) => v.label === size);
    if (!v) {
      setError("Choose a size to add this piece.");
      return;
    }
    addPiece(v.id);
    setError("");
  }
  return (
    <main className="atelier atelier-wrap product-page">
      <div className="piece-crumb">
        <Link href="/shop/">Collection</Link>
        <span>/</span>
        {product.name}
      </div>
      <section className="pdp">
        <Gallery key={color.name} color={color} name={product.name} />
        <div className="purchase rc-glass">
          <p className="eyebrow">Afterhours / {product.universe}</p>
          <h1>{product.name}</h1>
          <div className="price">
            {inr(product.price)} <small>Preview price</small>
          </div>
          <p className="description">{product.description}</p>
          <fieldset>
            <legend>Colour · {color.name}</legend>
            <div className="swatches">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  aria-label={c.name}
                  aria-pressed={color.name === c.name}
                  onClick={() => {
                    setColor(c);
                    if (
                      !product.variants.some(
                        (v) => v.color === c.name && v.label === size,
                      )
                    )
                      setSize("");
                    setError("");
                  }}
                >
                  <i style={{ background: c.swatch }} />
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="size-line">
            <span>Size</span>
            <SizeGuide hoodie={product.kind === "Hoodies"} />
          </div>
          <fieldset className="sizes">
            <legend className="sr-only">Select size</legend>
            {variants.map((v) => (
              <button
                key={v.id}
                aria-pressed={v.label === size}
                onClick={() => {
                  setSize(v.label);
                  setError("");
                }}
              >
                {v.label}
              </button>
            ))}
          </fieldset>
          <div className="purchase-bar">
            <p role="status" className="size-status">
              {error || [color.name, size].filter(Boolean).join(" / ")}
            </p>
            <div>
              <button className="rc-button" onClick={add}>
                <ShoppingBag size={18} />
                Add to bag
              </button>
              <button
                className="rc-button"
                data-tone="quiet"
                aria-label="Save piece"
                aria-pressed={saved.includes(product.id)}
                onClick={() => toggleSaved(product.id)}
              >
                {saved.includes(product.id) ? (
                  <Check size={18} />
                ) : (
                  <Bookmark size={18} />
                )}
              </button>
            </div>
          </div>
          <small className="media-note">
            Studio placeholders · garment colours and prints are illustrative.
          </small>
        </div>
      </section>
      <section className="edit-section">
        <div className="edit-head">
          <h2>Also in the edit.</h2>
          <Link href="/shop/" className="text-link">
            All pieces
          </Link>
        </div>
        <ProductGrid products={related} />
      </section>
    </main>
  );
}
