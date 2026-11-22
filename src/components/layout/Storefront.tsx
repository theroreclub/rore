"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { animate, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Header, type HeaderPanel } from "./Header";
import { Footer } from "./Footer";
import { ProductSearch } from "./ProductSearch";
import { sections } from "./Navigation";
import { BagContents, SavedContents } from "./StorePanels";
import { PageTransition } from "./PageTransition";
import type { CartItem, CartLine, Product } from "@/lib/catalog";

// The server and the first hydration render share the same empty bag.
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type View = HeaderPanel | null;
type ShopActions = {
  saved: string[];
  toggleSaved: (id: string) => void;
  addPiece: (variant: string) => void;
  lines: CartLine[];
  total: number;
  loaded: boolean;
};
const ShopContext = createContext<ShopActions | null>(null);
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("Storefront is missing from the root layout.");
  return shop;
}
function readStore(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function saveStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browsing can disable storage. */
  }
}

export function Storefront({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>(null);
  const [bag, setBag] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const modal = useRef<HTMLDialogElement>(null);
  const bagKey = "rore-concept-bag-v1";
  const savedKey = "rore-concept-saved-v1";
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientSnapshot,
    serverSnapshot,
  );
  if (hydrated && !loaded) {
    const oldBag = readStore(bagKey),
      oldSaved = readStore(savedKey);
    if (Array.isArray(oldBag))
      setBag(
        oldBag.filter(
          (l) =>
            l &&
            Number.isInteger(l.quantity) &&
            l.quantity > 0 &&
            l.quantity <= 99 &&
            products.some((p) => p.variants.some((v) => v.id === l.variantId)),
        ),
      );
    if (Array.isArray(oldSaved))
      setSaved(oldSaved.filter((id) => products.some((p) => p.id === id)));
    setLoaded(true);
  }
  useEffect(() => {
    if (loaded) {
      saveStore(bagKey, bag);
      saveStore(savedKey, saved);
    }
  }, [bag, saved, loaded]);
  useEffect(() => {
    const el = modal.current;
    if (view && el && !el.open) {
      el.showModal();
      if (view === "bag" && !reduced)
        animate(
          el,
          { x: ["100%", "0%"] },
          { duration: 0.23, ease: [0.22, 1, 0.36, 1] },
        );
    }
    if (view === "search")
      el?.querySelector<HTMLInputElement>("#rc-search")?.focus();
    if (!view && el?.open) el.close();
    document.body.style.overflow = view ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view, reduced]);
  const lines = bag.flatMap((line) => {
    const p = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    if (!p) return [];
    const variant = p.variants.find((v) => v.id === line.variantId)!;
    return [
      {
        ...line,
        p,
        label: variant.label,
        color: variant.color,
        image: p.colors.find((c) => c.name === variant.color)?.image ?? p.image,
      },
    ];
  });
  const quantity = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((n, l) => n + l.quantity * l.p.price, 0);
  function toggleSaved(id: string) {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }
  function addPiece(variant: string) {
    if (bag.some((l) => l.variantId === variant && l.quantity >= 99)) {
      setMessage("The preview limit is 99 per variant.");
      setView("bag");
      return;
    }
    setBag((prev) =>
      prev.some((l) => l.variantId === variant)
        ? prev.map((l) =>
            l.variantId === variant
              ? { ...l, quantity: Math.min(99, l.quantity + 1) }
              : l,
          )
        : [...prev, { variantId: variant, quantity: 1 }],
    );
    setMessage("Piece added to your preview bag.");
    setView("bag");
  }
  function changeQuantity(id: string, delta: number) {
    setMessage("");
    setBag((prev) =>
      prev
        .map((l) =>
          l.variantId === id
            ? { ...l, quantity: Math.min(99, l.quantity + delta) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }
  function closePanel() {
    const el = modal.current;
    if (view === "bag" && el && !reduced) {
      if (el.dataset.closing) return;
      el.dataset.closing = "true";
      animate(el, { x: "100%" }, { duration: 0.16, ease: "easeIn" }).then(
        () => {
          el.close();
          el.style.transform = "";
          delete el.dataset.closing;
          setView(null);
        },
      );
    } else setView(null);
  }

  const [panelPath, setPanelPath] = useState(pathname);
  if (panelPath !== pathname) {
    setPanelPath(pathname);
    setView(null);
  }
  function open(panel: HeaderPanel) {
    setMessage("");
    setView(panel);
  }
  return (
    <ShopContext.Provider
      value={{
        saved,
        toggleSaved,
        addPiece,
        lines,
        total,
        loaded,
      }}
    >
      <div id="top">
        <a className="skip" href="#page-content">
          Skip to content
        </a>
        <Header count={quantity} open={open} />
        <div id="page-content" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </div>
        <Footer />
        <dialog
          ref={modal}
          className={"panel rc-dialog " + (view === "bag" ? "bag-drawer" : "")}
          aria-labelledby="panel-title"
          onCancel={(e) => {
            e.preventDefault();
            closePanel();
          }}
          onClick={(e) => {
            if (e.target === modal.current) closePanel();
          }}
        >
          <div className="panel-content">
            <button
              className="close icon-button"
              aria-label="Close dialog"
              onClick={closePanel}
            >
              <X size={20} />
            </button>
            {view === "search" && (
              <ProductSearch
                products={products.filter((p) => !p.archived)}
                close={() => setView(null)}
              />
            )}
            {view === "menu" && (
              <>
                <h2 id="panel-title">Menu</h2>
                <nav className="rc-mobile-nav" aria-label="Mobile navigation">
                  {sections.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onNavigate={() => {
                        setView(null);
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                  <button onClick={() => open("saved")}>
                    Saved pieces ({saved.length})
                  </button>
                </nav>
              </>
            )}
            {view === "bag" && (
              <BagContents
                lines={lines}
                total={total}
                message={message}
                changeQuantity={changeQuantity}
                close={closePanel}
              />
            )}
            {view === "saved" && (
              <SavedContents
                products={products}
                saved={saved}
                toggleSaved={toggleSaved}
                close={() => setView(null)}
              />
            )}
          </div>
        </dialog>
      </div>
    </ShopContext.Provider>
  );
}
