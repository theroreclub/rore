"use client";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { inr, productPath, type Product } from "@/lib/catalog";
export default function ProductCard({
  product: p,
  saved,
  onSave,
}: {
  product: Product;
  saved: boolean;
  onSave: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className="product"
      initial={reducedMotion ? false : { y: 5, opacity: 0.96 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.28 }}
    >
      <div className="product-visual">
        <Link
          className="image-button"
          aria-label={"View " + p.name}
          href={productPath(p)}
        >
          <Image
            src={p.image}
            alt={p.name + " in " + p.color}
            fill
            sizes="(min-width: 900px) 25vw, 50vw"
            unoptimized
          />
          <span className="piece-link-label">View piece</span>
        </Link>
        <span className="universe-tag">{p.universe}</span>
        <button
          className={"save-button " + (saved ? "is-saved" : "")}
          aria-label={(saved ? "Unsave " : "Save ") + p.name}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <div>
          <small>
            {p.kind} / {p.color}
          </small>
          <Link href={productPath(p)}>{p.name}</Link>
        </div>
        <span>{inr(p.price)}</span>
      </div>
    </motion.article>
  );
}
