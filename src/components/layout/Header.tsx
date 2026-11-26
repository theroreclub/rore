"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navigation = [
  { label: "Shop All", href: "/products" },
  { label: "Anime", href: "/products?category=anime-oversized" },
  { label: "Streetwear", href: "/products?category=streetwear" },
  { label: "Fandom", href: "/products?category=fandom" },
  { label: "Accessories", href: "/products?category=accessories" },
];

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const search = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function openSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!menu.current?.open) search.current?.showModal();
      }
    }

    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  return (
    <>
      <header className="store-header">
        <div className="store-shell header-inner">
          <button className="header-icon mobile-menu" aria-label="Open menu" onClick={() => menu.current?.showModal()}><Menu /></button>
          <Link href="/" className="store-logo display-type" aria-label="RORE CLUB home">RORE<span>CLUB</span><i aria-hidden="true">.</i></Link>
          <nav aria-label="Shop" className="store-navigation">
            {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </nav>
          <div className="header-utilities">
            <button className="header-icon" aria-label="Search merch" onClick={() => search.current?.showModal()}><Search /></button>
            <Link className="header-icon header-account" aria-label={session ? "My account" : "Sign in"} href={session ? "/account" : "/login"}><UserRound /></Link>
            <Link className="header-icon" aria-label={`Bag with ${itemCount} items`} href="/cart">
              <ShoppingBag />
              <span className="bag-count">{itemCount}</span>
            </Link>
          </div>
        </div>
      </header>
      <dialog ref={search} className="store-dialog" aria-labelledby="search-title">
        <div className="store-dialog-heading">
          <h2 id="search-title">Search merch</h2>
          <button className="header-icon" aria-label="Close search" onClick={() => search.current?.close()}><X /></button>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault();
          const term = query.trim();
          if (!term) return;
          search.current?.close();
          router.push(`/products?search=${encodeURIComponent(term)}`);
        }}>
          <label className="sr-only" htmlFor="store-search">Product search</label>
          <input id="store-search" value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Try ghost tee or mecha" required autoFocus />
          <button className="drop-button drop-button-primary" type="submit">Search</button>
        </form>
      </dialog>
      <dialog ref={menu} className="store-dialog store-menu-dialog" aria-labelledby="menu-title">
        <div className="store-dialog-heading">
          <h2 id="menu-title">Shop RORE CLUB</h2>
          <button className="header-icon" aria-label="Close menu" onClick={() => menu.current?.close()}><X /></button>
        </div>
        <nav aria-label="Mobile shop navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => menu.current?.close()}>{item.label}</Link>)}
          <Link href={session ? "/account" : "/login"} onClick={() => menu.current?.close()}>{session ? "My account" : "Sign in"}</Link>
        </nav>
      </dialog>
    </>
  );
}
