"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { CartProductData } from "@/app/actions/cart";

interface AddToCartButtonProps {
  product: CartProductData;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isOutOfStock = product.stock <= 0;

  // Calculate existing quantity in cart to prevent exceeding total stock
  const existingInCart = items.find((i) => i.productId === product.id)?.quantity || 0;
  const remainingAvailable = Math.max(0, product.stock - existingInCart);
  const isMaxInCart = remainingAvailable === 0 && !isOutOfStock;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isMaxInCart || isAdding) return;

    setIsAdding(true);
    const res = await addItem(product, quantity);
    setIsAdding(false);

    if (res.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setQuantity(1);
    }
  };

  if (isOutOfStock) {
    return (
      <div className="w-full py-4 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-rose-500 font-bold text-center text-xs tracking-wider uppercase">
        Piece Sold Out // Archive Only
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Picker & Stock Info */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Select Quantity
        </span>

        <div className="flex items-center gap-3 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isAdding}
            aria-label="Decrease quantity"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 text-center font-mono font-bold text-sm text-zinc-100">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= product.stock || quantity >= remainingAvailable || isAdding}
            aria-label="Increase quantity"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add To Cart Action */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || isMaxInCart}
        className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-xl ${
          showSuccess
            ? "bg-emerald-600 text-white"
            : isMaxInCart
            ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-white hover:bg-zinc-200 text-zinc-950 shadow-white/5 active:scale-[0.99]"
        }`}
      >
        {isAdding ? (
          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        ) : showSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>Added to Bag</span>
          </>
        ) : isMaxInCart ? (
          <span>Max Stock Reached in Cart</span>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </>
        )}
      </button>

      {existingInCart > 0 && !isMaxInCart && (
        <p className="text-[11px] text-center text-zinc-500 font-mono">
          ({existingInCart} already in your bag)
        </p>
      )}
    </div>
  );
}
