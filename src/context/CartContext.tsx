"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  type VerifiedCartItem, type CartProductData, type GuestCartLine,
  getDatabaseCart, addToDatabaseCart, updateDatabaseCartQuantity,
  mergeGuestCartAction, getVerifiedGuestCartItems,
} from "@/app/actions/cart";

const GUEST_CART_STORAGE_KEY = "rore_guest_cart";
type CartResult = { success: boolean; error?: string };

function readGuestStorage(): GuestCartLine[] {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((item) =>
      typeof item?.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0
    ).slice(0, 100).map((item) => ({ ...item, quantity: Math.min(item.quantity, 20) })) : [];
  } catch {
    return [];
  }
}

function writeGuestStorage(cart: GuestCartLine[]) {
  if (cart.length) localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
  else localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

type CartContextValue = {
  items: VerifiedCartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (product: CartProductData, quantity?: number, variant?: string) => Promise<CartResult>;
  updateQuantity: (productId: string, quantity: number, variant?: string) => Promise<CartResult>;
  removeItem: (productId: string, variant?: string) => Promise<CartResult>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<VerifiedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const userId = session?.user?.id;

  const syncCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const guestItems = readGuestStorage();
      if (status === "authenticated" && userId) {
        const response = guestItems.length ? await mergeGuestCartAction(guestItems) : await getDatabaseCart();
        if (response.success) {
          if (guestItems.length) writeGuestStorage("unmerged" in response ? response.unmerged as GuestCartLine[] : []);
          setItems(response.items);
        }
      } else if (status === "unauthenticated") {
        setItems(guestItems.length ? await getVerifiedGuestCartItems(guestItems) : []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [status, userId]);

  useEffect(() => {
    if (status !== "loading") startTransition(syncCart);
  }, [status, syncCart]);

  async function updateGuest(productId: string, quantity: number, variant: string, limit: number, add: boolean) {
    const cart = readGuestStorage();
    const matches = (item: GuestCartLine) => item.productId === productId && (item.variant || "") === variant;
    const current = cart.find(matches);
    const next = Math.min((add ? current?.quantity ?? 0 : 0) + quantity, limit);
    const updated = cart.filter((item) => !matches(item));
    if (next > 0) updated.push({ productId, quantity: next, variant });
    const verified = await getVerifiedGuestCartItems(updated);
    if (next > 0 && !verified.some(matches)) return { success: false, error: "This option is unavailable." };
    writeGuestStorage(verified.map(({ productId: id, quantity: count, variant: option }) => ({
      productId: id, quantity: count, variant: option,
    })));
    setItems(verified);
    return { success: true };
  }

  async function addItem(product: CartProductData, quantity = 1, variant = "") {
    if (status === "authenticated") {
      const result = await addToDatabaseCart(product.id, quantity, variant);
      if (result.success) await syncCart();
      return result;
    }
    return updateGuest(product.id, quantity, variant, Math.min(product.stock, 20), true);
  }

  async function updateQuantity(productId: string, quantity: number, variant = "") {
    if (status === "authenticated") {
      const result = await updateDatabaseCartQuantity(productId, quantity, variant);
      if (result.success) await syncCart();
      return result;
    }
    const limit = items.find((item) => item.productId === productId && item.variant === variant)?.product.stock ?? 20;
    return updateGuest(productId, quantity, variant, limit, false);
  }

  return (
    <CartContext.Provider value={{
      items, isLoading, addItem, updateQuantity, refreshCart: syncCart,
      removeItem: (productId, variant) => updateQuantity(productId, 0, variant),
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider.");
  return context;
}
