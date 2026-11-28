"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { calculateShippingFee } from "@/config/shipping";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";

function CheckoutNotice() {
  const params = useSearchParams();
  return params.get("error") === "item_unavailable"
    ? <p className="py-2 text-sm" role="alert">An item or size in your bag is no longer available in the quantity selected. Update your bag to continue.</p>
    : null;
}

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isLoading } = useCart();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState({ text: "", error: false });
  async function changeBag(action: () => Promise<{ success: boolean; error?: string }>, message: string) {
    if (pending) return;
    setPending(true);
    try {
      const result = await action();
      setNotice({ text: result.success ? message : result.error || "Couldn’t update your bag.", error: !result.success });
    } catch { setNotice({ text: "Couldn’t update your bag. Please try again.", error: true }); }
    finally { setPending(false); }
  }
  const feedback = notice.text
    ? <p className="py-2 text-sm" role={notice.error ? "alert" : "status"}>{notice.text}</p>
    : <Suspense fallback={null}><CheckoutNotice /></Suspense>;
  const shippingFee = calculateShippingFee(subtotal);
  const isPreview = items.some((item) => item.productId.startsWith("preview-"));

  if (isLoading) {
    return (
      <div className="shop-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-shop-wine border-t-transparent rounded-full animate-spin" />
        <p className="text-xs tracking-widest text-shop-muted uppercase mt-4">
          Updating your bag…
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shop-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {feedback}
        <div className="max-w-md mx-auto text-center flex flex-col items-center p-8 sm:p-12 rounded-lg glass">
          <div className="w-20 h-20 rounded-md glass flex items-center justify-center text-shop-wine mb-6 shadow-xl">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-shop-ink uppercase tracking-tight mt-1">
            Your bag is empty
          </h1>
          <p className="text-xs sm:text-sm text-shop-muted mt-3 leading-relaxed">
            Find your next tee, hoodie, or accessory in the collection.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-shop-wine hover:bg-[#41151b] text-shop-ivory font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-white/5 group"
          >
            <span>Browse merch</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {feedback}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-shop-rule mb-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-shop-wine uppercase">
            {itemCount} {itemCount === 1 ? "PIECE" : "PIECES"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-shop-ink uppercase tracking-tight mt-1">
            Shopping bag
          </h1>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-shop-muted hover:text-shop-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const isAtMaxStock = item.quantity >= item.product.stock;
            const itemImage = item.product.images[0] || "/images/products/vintage-boxy-tee.svg";
            const lineTotal = item.product.price * item.quantity;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-6 rounded-md glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all hover:border-shop-rule"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden glass shrink-0 group"
                  >
                    <Image
                      src={itemImage}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="space-y-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-bold text-sm sm:text-base text-shop-ink hover:text-shop-wine transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-shop-muted">
                      {item.variant && <>{item.variant} · </>}
                      Unit: {formatPrice(item.product.price)}
                    </p>

                    {isAtMaxStock && (
                      <p className="text-[11px] text-amber-900">
                        Quantity limit reached
                      </p>
                    )}
                  </div>
                </div>

                {/* Stepper + Line Total + Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-shop-rule">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 p-1 rounded-xl glass">
                    <button
                      type="button"
                      onClick={() => changeBag(() => updateQuantity(item.productId, item.quantity - 1, item.variant), "Quantity updated.")}
                      disabled={pending || item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="p-1 rounded-lg text-shop-muted hover:text-shop-ink hover:bg-shop-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-7 text-center font-bold text-xs text-shop-ink">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => changeBag(() => updateQuantity(item.productId, item.quantity + 1, item.variant), "Quantity updated.")}
                      disabled={pending || isAtMaxStock}
                      aria-label="Increase quantity"
                      className="p-1 rounded-lg text-shop-muted hover:text-shop-ink hover:bg-shop-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="font-bold text-sm sm:text-base text-shop-ink">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => changeBag(() => removeItem(item.productId, item.variant), "Item removed from your bag.")}
                    title="Remove item"
                    aria-label={`Remove ${item.product.name}`}
                    className="p-2 rounded-xl text-shop-muted hover:text-shop-wine hover:bg-shop-soft transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar in .glass-strong */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-lg glass-strong space-y-6 sticky top-24">
          <h2 className="text-base font-bold text-shop-ink uppercase tracking-wider">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs border-b border-shop-rule pb-6">
            <div className="flex justify-between text-shop-muted">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-bold text-shop-ink">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-shop-muted">
              <span>Estimated Shipping</span>
              <span className="text-shop-ink font-bold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-800 uppercase text-[11px] font-bold">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div className="flex justify-between text-shop-muted">
              <span>Estimated Taxes</span>
              <span className="text-shop-muted">Included</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold uppercase tracking-wider text-shop-ink">
              Total
            </span>
            <span className="text-2xl font-black text-shop-ink tracking-tight">
              {formatPrice(subtotal + shippingFee)}
            </span>
          </div>

          {/* Checkout Button */}
          <div className="space-y-2">
            {isPreview ? (
              <p className="border p-3 text-center text-sm text-shop-ink">Checkout is disabled in the storefront preview.</p>
            ) : <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-full bg-shop-wine hover:bg-[#41151b] text-shop-ivory font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-white/5 transition-all group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>}
            <p className="text-[11px] text-center text-shop-muted">
              ⚡ Free shipping on orders over ₹1,999.
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="space-y-3 pt-4 border-t border-shop-rule text-xs text-shop-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-shop-wine shrink-0" />
              <span>Ships across India</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Secure Razorpay checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
