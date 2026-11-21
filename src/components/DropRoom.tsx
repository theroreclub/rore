"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingBag, SlidersHorizontal, BookOpen, X } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductDetail from "./ProductDetail";
import { useShop } from "./layout/Storefront";
import type { Product } from "@/lib/catalog";
const categories = ["All pieces", "Tees", "Hoodies", "Desk mats"] as const;
const art = (name: string) => "/club-art/" + name;
export default function DropRoom({
  products,
  product,
}: {
  products: Product[];
  product?: Product;
}) {
  const [category, setCategory] = useState<string>("All pieces");
  const [world, setWorld] = useState<string>("");

  const { saved, toggleSaved, addPiece, openNote, collectionRevision } =
    useShop();
  useEffect(() => {
    setWorld("");
    setCategory("All pieces");
  }, [collectionRevision]);
  const filtered = products.filter(
    (p) =>
      (category === "All pieces" || category === p.kind) &&
      (!world || p.universe === world),
  );
  function goToDrop(universe = "") {
    setWorld(universe);
    setCategory("All pieces");
  }
  return (
    <>
      {" "}
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
              <a className="cta" href="#drop" onClick={() => goToDrop()}>
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
                  href="#drop"
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
            <button className="secondary" onClick={openNote}>
              <BookOpen size={18} /> Read the field note
            </button>
          </section>
        </main>
      )}
    </>
  );
}
