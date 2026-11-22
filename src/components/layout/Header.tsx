"use client";

import Link from "next/link";
import { Bookmark, Menu, Search, ShoppingBag } from "lucide-react";
import { sections, Wordmark } from "./Navigation";

export type HeaderPanel = "menu" | "search" | "saved" | "bag";
type Props = {
  count: number;
  open: (panel: HeaderPanel) => void;
};

export function Header({ count, open }: Props) {
  return (
    <header className="rc-header rc-glass">
      <div className="rc-bar">
        <Wordmark />
        <nav className="rc-nav" aria-label="Main navigation">
          {sections.map(({ label, href }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="rc-tools">
          <button
            aria-label="Search products"
            aria-haspopup="dialog"
            onClick={() => open("search")}
          >
            <Search />
          </button>
          <button
            className="rc-desktop-save"
            aria-label="Saved pieces"
            aria-haspopup="dialog"
            onClick={() => open("saved")}
          >
            <Bookmark />
          </button>
          <button
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            aria-haspopup="dialog"
            onClick={() => open("bag")}
          >
            <ShoppingBag />
            <span className="rc-count">{count}</span>
          </button>
          <button
            className="rc-menu-toggle"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => open("menu")}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
