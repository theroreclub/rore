"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ShoppingBag,
  X,
  Menu,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  Check,
  BookOpen,
} from "lucide-react";
import ProductCard from "./ProductCard";
import ProductDetail from "./ProductDetail";
import { inr, productPath, type Product } from "@/lib/catalog";

type View = "bag" | "saved" | "note" | "menu" | null;
type Line = { variantId: string; quantity: number };
const categories = ["All pieces", "Tees", "Hoodies", "Desk mats"] as const;
const art = (name: string) => "/club-art/" + name;
const links = [
  ["The drop", "#drop"],
  ["Universes", "#universes"],
  ["Club notes", "#notes"],
];
function Brand() {
  return (
    <a className="brand" href="/" aria-label="Rore Club home">
      <span className="brand-mark" aria-hidden="true" />
      <span>
        RORE<span className="brand-club">CLUB</span>
      </span>
    </a>
  );
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
export default function DropRoom({
  products,
  product,
}: {
  products: Product[];
  product?: Product;
}) {
  const [category, setCategory] = useState<string>("All pieces");
  const [world, setWorld] = useState<string>("");
  const [active, setActive] = useState(product ? "" : "#drop");
  const [view, setView] = useState<View>(null);
  const [bag, setBag] = useState<Line[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const modal = useRef<HTMLDialogElement>(null);
  const bagKey = "rore-concept-bag-v1";
  const savedKey = "rore-concept-saved-v1";
  useEffect(() => {
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
  }, [products]);
  useEffect(() => {
    if (loaded) {
      saveStore(bagKey, bag);
      saveStore(savedKey, saved);
    }
  }, [bag, saved, loaded]);
  useEffect(() => {
    const el = modal.current;
    if (view && el && !el.open) el.showModal();
    if (!view && el?.open) el.close();
    document.body.style.overflow = view ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive("#" + e.target.id);
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    for (const [, hash] of links) {
      const el = document.querySelector(hash);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  const filtered = products.filter(
    (p) =>
      (category === "All pieces" || category === p.kind) &&
      (!world || p.universe === world),
  );
  const lines = bag.flatMap((line) => {
    const p = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    return p
      ? [
          {
            ...line,
            p,
            label: p.variants.find((v) => v.id === line.variantId)!.label,
          },
        ]
      : [];
  });
  const quantity = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((n, l) => n + l.quantity * l.p.price, 0);
  function toggleSaved(id: string) {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }
  function addPiece(variant: string) {
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
    const drawer = modal.current;
    if (
      view === "bag" &&
      drawer &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if (drawer.dataset.closing) return;
      drawer.dataset.closing = "true";
      drawer
        .animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
          { duration: 180, easing: "ease-in", fill: "forwards" },
        )
        .finished.then((animation) => {
          drawer.close();
          animation.cancel();
          delete drawer.dataset.closing;
          setView(null);
        });
      return;
    }
    setView(null);
  }
  function goToDrop(universe = "") {
    setWorld(universe);
    setCategory("All pieces");
    setActive("#drop");
    setView(null);
  }
  return (
    <div id="top">
      <a className="skip" href={product ? "/#drop" : "#drop"}>
        Skip to collection
      </a>
      <header>
        <div className="nav-shell">
          <Brand />
          <nav aria-label="Main navigation">
            {links.map(([title, hash]) => (
              <a
                key={hash}
                className={active === hash ? "active" : ""}
                href={product ? "/" + hash : hash}
                onClick={() => {
                  setActive(hash);
                  if (hash === "#drop") goToDrop();
                }}
              >
                {title}
              </a>
            ))}
          </nav>
          <div className="nav-tools">
            <button
              className="icon-button save-nav"
              aria-label={"Saved pieces, " + saved.length}
              onClick={() => setView("saved")}
            >
              <Bookmark size={19} />
              {saved.length > 0 && <span className="dot" />}
            </button>
            <button
              className="bag-button"
              onClick={() => {
                setMessage("");
                setView("bag");
              }}
            >
              <ShoppingBag size={17} />
              <span>Bag</span>
              <b>{quantity}</b>
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => setView("menu")}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      {product ? (
        <main className="piece-page shell">
          <ProductDetail
            key={product.id}
            product={product}
            saved={saved.includes(product.id)}
            onSave={() => toggleSaved(product.id)}
            onAdd={addPiece}
          />
          <section className="related">
            <div className="section-kicker">
              <i /> THE COLLECTION
            </div>
            <h2>
              MORE FROM THE DROP<span>.</span>
            </h2>
            <div className="product-grid">
              {products
                .filter((p) => p.id !== product.id)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    saved={saved.includes(p.id)}
                    onSave={() => toggleSaved(p.id)}
                  />
                ))}
            </div>
          </section>
        </main>
      ) : (
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <Image
              className="hero-art"
              src={art("afterhours.webp")}
              alt="Ink illustration of a dragon coiling over a hooded figure against a red sun"
              fill
              priority
              unoptimized
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <div className="flag">
                <i /> FEATURED DROP <span>/</span> AFTERHOURS
              </div>
              <h1 id="hero-title">
                WEAR YOUR
                <br />
                <em>ALTER EGO.</em>
              </h1>
              <p>
                For the stories you carry long after the credits roll.
                <br className="wide-break" /> Original merch for the fandom that
                found you.
              </p>
              <a
                className="cta"
                href={product ? "/#drop" : "#drop"}
                onClick={() => goToDrop()}
              >
                <ShoppingBag size={17} /> Explore the drop
              </a>
            </div>
          </section>
          <div
            className="tape"
            aria-label="Manga, comics, streetwear, printed on demand"
          >
            <div aria-hidden="true">
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i}>
                  <b /> MANGA CULTURE <b /> COMIC ENERGY <b /> ORIGINAL
                  STREETWEAR <b /> PRINTED ON DEMAND{" "}
                </span>
              ))}
            </div>
          </div>
          <section id="drop" className="shelf shell">
            <div className="section-kicker">
              <i /> THE COLLECTION
            </div>
            <div className="shelf-head">
              <h2>
                THE DROP ROOM<span>.</span>
              </h2>
              <div className="filters" aria-label="Product type">
                <SlidersHorizontal size={16} aria-hidden />
                {categories.map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {world && (
              <button className="world-filter" onClick={() => setWorld("")}>
                {world} universe <X size={14} />
              </button>
            )}
            <div className="product-grid">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  saved={saved.includes(p.id)}
                  onSave={() => toggleSaved(p.id)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty">
                <p>No {category.toLowerCase()} in this universe yet.</p>
                <button className="secondary" onClick={() => goToDrop()}>
                  See all pieces
                </button>
              </div>
            )}
            <p className="preview-hint">
              Concept collection · Preview pieces and prices
            </p>
          </section>
          <section id="universes" className="worlds shell">
            <div className="section-kicker">
              <i /> FIND YOUR PEOPLE
            </div>
            <h2>
              PICK YOUR UNIVERSE<span>.</span>
            </h2>
            <div className="world-grid">
              {[
                ["Manga", "manga-world.webp", "Manga culture"],
                ["Comics", "comic-world.webp", "Comic energy"],
              ].map(([id, file, label]) => (
                <a
                  key={id}
                  href={product ? "/#drop" : "#drop"}
                  className="world-card"
                  onClick={() => goToDrop(id)}
                >
                  <Image src={art(file)} fill unoptimized alt="" />
                  <div />
                  <span>{label}</span>
                  <b>Explore pieces</b>
                </a>
              ))}
            </div>
          </section>
          <section id="notes" className="notes shell">
            <div>
              <div className="section-kicker">
                <i /> CLUB NOTES
              </div>
              <h2>
                BEHIND THE INK<span>.</span>
              </h2>
              <p>The dragon, the red sun, and the story behind Afterhours.</p>
            </div>
            <button className="secondary" onClick={() => setView("note")}>
              <BookOpen size={18} /> Read the field note
            </button>
          </section>
        </main>
      )}
      <footer className="shell">
        <Brand />
        <span>Original merch for the fans.</span>
        <a href="#top">Back to top</a>
      </footer>
      <dialog
        ref={modal}
        className={"panel " + (view === "bag" ? "bag-drawer" : "")}
        aria-labelledby="panel-title"
        onCancel={(event) => {
          event.preventDefault();
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
            <X size={21} />
          </button>
          {view === "bag" && (
            <>
              <div className="section-kicker">
                <i /> YOUR SELECTION
              </div>
              <h2 id="panel-title">
                Your bag<span>.</span>
              </h2>
              {message && (
                <p role="status" className="feedback">
                  <Check size={15} /> {message}
                </p>
              )}
              {lines.length ? (
                <>
                  <div className="bag-list">
                    {lines.map((l) => (
                      <div className="line" key={l.variantId}>
                        <Image
                          src={art(l.p.image)}
                          alt=""
                          width={74}
                          height={74}
                          unoptimized
                        />
                        <div className="line-details">
                          <a className="bag-piece" href={productPath(l.p)}>
                            {l.p.name}
                          </a>
                          <small>
                            {l.p.color} / {l.label}
                          </small>
                          <div className="qty">
                            <button
                              aria-label={"Decrease " + l.p.name + " quantity"}
                              onClick={() => changeQuantity(l.variantId, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            {l.quantity}
                            <button
                              disabled={l.quantity >= 99}
                              aria-label={"Increase " + l.p.name + " quantity"}
                              onClick={() => changeQuantity(l.variantId, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="line-end">
                          {inr(l.p.price * l.quantity)}
                          <button
                            className="icon-button"
                            aria-label={"Remove " + l.p.name}
                            onClick={() =>
                              changeQuantity(l.variantId, -l.quantity)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="subtotal">
                    <b>Preview subtotal</b>
                    <b>{inr(total)}</b>
                  </div>
                  <p>
                    These pieces are part of a design preview. Ordering opens
                    with the live collection.
                  </p>
                </>
              ) : (
                <p>
                  Your bag is empty. Pick a piece and choose your size to start
                  your edit.
                </p>
              )}
              <button className="cta drawer-continue" onClick={closePanel}>
                Continue browsing
              </button>
            </>
          )}
          {view === "saved" && (
            <>
              <div className="section-kicker">
                <i /> YOUR EDIT
              </div>
              <h2 id="panel-title">
                Saved pieces<span>.</span>
              </h2>
              {!saved.length && (
                <p>Tap the bookmark on a piece to keep it here for later.</p>
              )}
              {products
                .filter((p) => saved.includes(p.id))
                .map((p) => (
                  <div className="line" key={p.id}>
                    <Image
                      src={art(p.image)}
                      alt=""
                      width={72}
                      height={72}
                      unoptimized
                    />
                    <a className="saved-name" href={productPath(p)}>
                      {p.name}
                      <small>{inr(p.price)}</small>
                    </a>
                    <button
                      className="icon-button"
                      aria-label={"Unsave " + p.name}
                      onClick={() => toggleSaved(p.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              <a
                className="secondary"
                href={product ? "/#drop" : "#drop"}
                onClick={() => goToDrop()}
              >
                Browse the drop
              </a>
            </>
          )}
          {view === "note" && (
            <>
              <div className="section-kicker">
                <i /> AFTERHOURS / FIELD NOTE
              </div>
              <h2 id="panel-title">
                Behind the ink<span>.</span>
              </h2>
              <Image
                className="note-art"
                src={art("afterhours.webp")}
                alt="The Afterhours dragon illustration"
                width={650}
                height={270}
                unoptimized
              />
              <p>
                Some panels deserve a second look. Afterhours starts with one of
                those pauses: a hooded figure, an ink-black sky, and a dragon
                crossing the sun.
              </p>
              <p>
                The red circle holds the composition together. The dragon coils
                past its edge, just as a character breaks the frame on a manga
                page. That same contrast carries over to the Sun Dragon Tee.
              </p>
              <a className="cta" href={productPath(products[0])}>
                See the Sun Dragon Tee
              </a>
            </>
          )}
          {view === "menu" && (
            <>
              <div className="section-kicker">
                <i /> RORE CLUB
              </div>
              <h2 id="panel-title">
                Menu<span>.</span>
              </h2>
              <div className="menu-links">
                {links.map(([title, hash]) => (
                  <a
                    key={hash}
                    href={product ? "/" + hash : hash}
                    onClick={() => {
                      setView(null);
                      setActive(hash);
                      if (hash === "#drop") goToDrop();
                    }}
                  >
                    {title}
                  </a>
                ))}
                <button onClick={() => setView("saved")}>
                  Saved pieces ({saved.length})
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
