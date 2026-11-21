"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, ShoppingBag, ZoomIn, ZoomOut } from "lucide-react";
import { type Product, inr } from "@/lib/catalog";

export default function ProductDetail({
  product,
  saved,
  onSave,
  onAdd,
}: {
  product: Product;
  saved: boolean;
  onSave: () => void;
  onAdd: (variant: string) => void;
}) {
  const [variant, setVariant] = useState(
    product.variants.length === 1 ? product.variants[0].id : "",
  );
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(false);
  const Zoom = detail ? ZoomOut : ZoomIn;
  return (
    <>
      <div className="piece-crumb">
        <Link href="/#drop">The Drop Room</Link>
        <span>/</span>
        {product.name}
      </div>
      <section className="piece-layout" aria-labelledby="piece-title">
        <div className="piece-photo">
          <button
            className={"zoom-photo" + (detail ? " enlarged" : "")}
            aria-pressed={detail}
            aria-label={detail ? "Show full piece" : "Zoom in on print"}
            onClick={() => setDetail(!detail)}
          >
            <Image
              src={"/club-art/" + product.image}
              alt={product.name + " in " + product.color}
              width={627}
              height={627}
              priority
              unoptimized
            />
            <span className="zoom-label">
              <Zoom size={18} />
              {detail ? "Full piece" : "Print detail"}
            </span>
          </button>
        </div>
        <div className="piece-copy">
          <div className="section-kicker">
            <i />
            {product.universe} / Afterhours
          </div>
          <h1 id="piece-title">
            {product.name}
            <span>.</span>
          </h1>
          <div className="piece-price">
            {inr(product.price)} <small>Preview price</small>
          </div>
          <p>{product.description}</p>
          <div className="colour-line">
            <span>Colour</span>
            <b>{product.color}</b>
          </div>
          <fieldset>
            <legend>
              {product.variants.length > 1 ? "Select size" : "Format"}
            </legend>
            <div className="sizes">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  aria-pressed={variant === v.id}
                  onClick={() => {
                    setVariant(v.id);
                    setError("");
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="size-error" role="alert">
              {error}
            </p>
          )}
          <div className="piece-actions">
            <button
              className="cta"
              onClick={() => {
                if (!variant) {
                  setError("Choose a size to add this piece.");
                  return;
                }
                onAdd(variant);
              }}
            >
              <ShoppingBag size={18} />
              Add to preview bag
            </button>
            <button
              className="secondary"
              aria-pressed={saved}
              aria-label={saved ? "Unsave this piece" : "Save this piece"}
              onClick={onSave}
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <small className="concept-note">
            Concept piece · Ordering opens with the live collection.
          </small>
        </div>
      </section>
    </>
  );
}
