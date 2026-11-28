import Link from "next/link";

const footerGroups = [
  { title: "Collections", links: [
    ["Anime", "/products?category=anime-oversized"], ["Streetwear", "/products?category=streetwear"],
    ["Fandom", "/products?category=fandom"], ["Accessories", "/products?category=accessories"],
  ] },
  { title: "Shop", links: [
    ["All merch", "/products"], ["Wishlist", "/products?wishlist=1"], ["Shopping bag", "/cart"],
  ] },
  { title: "Account", links: [
    ["My account", "/account"], ["Order history", "/account/orders"], ["Create account", "/signup"],
  ] },
];

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="store-shell">
        <div className="store-footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-label display-type" aria-label="RORE CLUB home">RORE CLUB.</Link>
            <p>Anime and fandom merch,<br /><em>printed to order.</em></p>
          </div>
          {footerGroups.map(({ title, links }) => (
            <nav key={title} aria-label={`Footer ${title.toLowerCase()}`}>
              <h2>{title}</h2>
              {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
          ))}
        </div>
        <div className="footer-imprint display-type" aria-hidden="true"><span>RORE</span><span>CLUB<b>.</b></span></div>
        <div className="store-copyright">
          <span>© RORE CLUB</span>
          <Link href="/privacy">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
