import Link from "next/link";

export const metadata = { title: "Page not found | RORE CLUB", description: "Find your way back to the RORE CLUB store or browse all merch." };

export default function NotFound() {
  return <section className="account-paper"><div className="account-sheet missing-page">
    <p className="missing-code">404</p><h1>Page not found.</h1>
    <p className="account-intro">This link may have changed. You can still browse the collection.</p>
    <Link href="/products" className="account-submit">Shop all merch</Link>
    <p className="account-switch"><Link href="/">Back to home</Link></p>
  </div></section>;
}
