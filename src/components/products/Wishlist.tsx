"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";

const key = "rore:wishlist:v1";
const changed = "rore-wishlist-change";
let memory = "[]";

function snapshot() {
  try { return localStorage.getItem(key) ?? memory; } catch { return memory; }
}

function readIds(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value.filter(id => typeof id === "string") : [];
  } catch { return []; }
}

function subscribe(update: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) {
      memory = event.newValue ?? "[]";
      update();
    }
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changed, update);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changed, update);
  };
}

export function useWishlist() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return raw === null ? null : readIds(raw);
}

export function WishlistHeart({ id, name }: { id: string; name: string }) {
  const saved = useWishlist()?.includes(id) ?? false;
  function toggle() {
    const ids = readIds(snapshot());
    memory = JSON.stringify(ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
    try { localStorage.setItem(key, memory); } catch { /* Keep this visit's selections in memory. */ }
    window.dispatchEvent(new Event(changed));
  }
  return (
    <button type="button" className="wishlist-heart" onClick={toggle} aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}>
      <Heart aria-hidden="true" size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
