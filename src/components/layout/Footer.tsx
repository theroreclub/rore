import Link from "next/link";
import { sections, Wordmark } from "./Navigation";

export function Footer() {
  return (
    <footer className="rc-footer">
      <div className="rc-footer-inner">
        <div>
          <Wordmark />
          <p>Graphic streetwear, printed to order.</p>
        </div>
        <nav aria-label="Footer navigation">
          {sections.map(({ label, href }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <a href="#top" className="rc-top">
          Back to top
        </a>
      </div>
    </footer>
  );
}
