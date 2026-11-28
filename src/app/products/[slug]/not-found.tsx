import Link from "next/link";

export default function ProductNotFound() {
  return <section className="account-paper"><div className="account-sheet missing-page">
    <p className="missing-code">404</p><h1>Product unavailable.</h1>
    <p className="account-intro">This item is no longer in the catalog.</p>
    <Link href="/products" className="account-submit">Browse all merch</Link>
  </div></section>;
}
