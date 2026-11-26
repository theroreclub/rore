import Link from "next/link";

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="store-shell">
        <div className="store-footer-top">
          <div>
            <Link href="/" className="store-logo display-type" aria-label="RORE CLUB home">RORE<span>CLUB</span><i aria-hidden="true">.</i></Link>
            <p>Anime-inspired merch. Printed to order.</p>
          </div>
          <nav aria-label="Shop collections">
            <strong>Shop</strong>
            <Link href="/products">All merch</Link>
            <Link href="/products?category=anime-oversized">Anime</Link>
            <Link href="/products?category=streetwear">Streetwear</Link>
            <Link href="/products?category=fandom">Fandom</Link>
            <Link href="/products?category=accessories">Accessories</Link>
          </nav>
          <nav aria-label="Customer account">
            <strong>Account</strong>
            <Link href="/account">My account</Link>
            <Link href="/account/orders">Order history</Link>
            <Link href="/cart">Shopping bag</Link>
          </nav>
        </div>
        <div className="store-copyright">
          <span>© RORE CLUB</span>
          <Link href="/privacy">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
