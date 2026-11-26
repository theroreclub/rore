"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SHIPPING_CONFIG } from "@/config/shipping";
import { formatPrice } from "@/lib/utils";
import { ProductPrice } from "./ProductPrice";

interface ProductBuyingPanelProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    regularPrice?: number | null;
    stock: number;
    images: string[];
    category?: { name: string; slug: string } | null;
  };
  options: string[];
  preview: boolean;
}

export function ProductBuyingPanel({ product, options, preview }: ProductBuyingPanelProps) {
  const { addItem, items, isLoading } = useCart();
  const [variant, setVariant] = useState(options.length === 1 ? options[0] : "");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string }>();
  const stock = options.length ? 20 : Math.min(product.stock, 20);
  const inBag = items.find((item) => item.productId === product.id && item.variant === variant)?.quantity ?? 0;
  const limit = Math.max(0, stock - inBag);
  const canBuy = (preview || options.length > 0) && limit > 0;

  async function addToBag() {
    if (!canBuy || (options.length && !variant)) return;
    setAdding(true);
    try {
      const result = await addItem({ ...product, stock }, Math.min(quantity, limit), variant);
      setFeedback({
        success: result.success,
        text: result.success ? "Added to your bag." : result.error || "Unable to add this item.",
      });
      if (result.success) setQuantity(1);
    } catch {
      setFeedback({ success: false, text: "Unable to add this item. Try again." });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6 py-2">
      {product.category && (
        <Link className="store-text-link" href={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
      )}
      <h1 className="display-type text-5xl uppercase sm:text-6xl">{product.name}</h1>
      <p className="text-2xl font-extrabold text-accent"><ProductPrice price={product.price} regularPrice={product.regularPrice} /></p>
      <p className="text-base leading-relaxed text-zinc-300">{product.description}</p>

      {options.length > 0 && (
        <fieldset className="space-y-2 border-t pt-5">
          <legend className="sr-only">Choose an option</legend>
          <p aria-hidden="true" className="font-semibold">Choose an option</p>
          <div className="flex flex-wrap gap-2">
            {options.map((label) => (
              <label key={label} className="cursor-pointer">
                <input
                  className="peer sr-only" type="radio" name="product-variant" value={label} checked={variant === label}
                  onChange={() => { setVariant(label); setQuantity(1); setFeedback(undefined); }}
                />
                <span className="inline-flex min-h-11 items-center border px-4 text-sm peer-checked:border-accent peer-checked:bg-accent/15 peer-focus-visible:outline-2">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {canBuy && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-h-12 items-center border">
            <button type="button" className="header-icon" aria-label="Decrease quantity" disabled={quantity <= 1 || adding} onClick={() => setQuantity((value) => value - 1)}><Minus /></button>
            <span aria-live="polite" className="min-w-6 text-center text-sm">{Math.min(quantity, limit)}</span>
            <button type="button" className="header-icon" aria-label="Increase quantity" disabled={quantity >= limit || adding} onClick={() => setQuantity((value) => value + 1)}><Plus /></button>
          </div>
          <button className="drop-button drop-button-primary flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-55" type="button"
            disabled={adding || isLoading || (options.length > 0 && !variant)} onClick={addToBag}>
            <ShoppingBag className="size-4" />{adding ? "Adding…" : options.length && !variant ? "Choose an option" : "Add to bag"}
          </button>
        </div>
      )}

      {!canBuy && (
        <p role="status" className="text-sm text-zinc-300">
          {stock <= 0 || (!preview && !options.length) ? "Currently unavailable." : "You’ve reached the quantity limit for this option."}
        </p>
      )}
      {feedback && (
        <p role="status" className="flex flex-wrap items-center gap-2 text-sm">
          {feedback.success && <Check className="size-4 text-accent" />}
          {feedback.text}
          {feedback.success && <Link href="/cart" className="store-text-link">View bag</Link>}
        </p>
      )}
      {preview && <p className="text-sm text-zinc-400">Sample product. Checkout is disabled in the storefront preview.</p>}
      <div className="flex items-center gap-2 border-t pt-5 text-sm text-zinc-300">
        <Truck className="size-5 text-accent" />
        Printed to order · Free shipping over {formatPrice(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD)}
      </div>
    </div>
  );
}
