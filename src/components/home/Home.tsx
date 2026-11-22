import Image from "next/image";
import Link from "next/link";
import { collection } from "@/lib/catalog";
import { Newsletter } from "./Newsletter";
import { ProductGrid } from "../shop/ProductGrid";

export function Home() {
  return (
    <main className="atelier">
      <section className="campaign">
        {/* CAMPAIGN IMAGE SLOT: replace this neutral cotton close-up with a licensed wide campaign photograph. */}
        <Image
          fill
          preload
          src="/atelier/campaign-placeholder.webp"
          sizes="100vw"
          alt=""
          unoptimized
        />
        <div className="campaign-shade" />
        <div className="atelier-wrap campaign-inner">
          <p className="eyebrow">
            <span className="ink-rule" />
            The Afterhours collection
          </p>
          <h1>
            In good
            <br />
            <em>shadow.</em>
          </h1>
          <p className="campaign-intro">
            Streetwear drawn from the stories we stay up for.
          </p>
          <Link href="/shop/" className="rc-button">
            Shop the collection
          </Link>
        </div>
      </section>
      <section id="drop" className="atelier-wrap edit-section">
        <div className="edit-head">
          <div>
            <p className="eyebrow">The current drop</p>
            <h2>Afterhours edit.</h2>
          </div>
          <Link className="text-link" href="/shop/">
            View all pieces
          </Link>
        </div>
        <ProductGrid products={collection} />
      </section>
      <section
        id="categories"
        className="atelier-wrap category-pair"
        aria-label="Shop by silhouette"
      >
        {[
          { label: "T-shirts", cat: "Tees", image: "black-tee" },
          { label: "Hoodies", cat: "Hoodies", image: "grey-hoodie" },
        ].map((c) => (
          <Link
            key={c.cat}
            href={"/shop/?category=" + c.cat}
            className="category-tile rc-product-stage"
          >
            {/* CATEGORY IMAGE SLOT: licensed silhouette photograph for each garment category. */}
            <Image
              src={"/atelier/" + c.image + ".webp"}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              alt=""
              unoptimized
            />
            <span>{c.label}</span>
          </Link>
        ))}
      </section>
      <section id="story" className="story-strip">
        <div className="atelier-wrap">
          <p className="eyebrow">Inside RORECLUB</p>
          <h2>
            From the page
            <br />
            to the everyday.
          </h2>
          <p>
            RORECLUB starts with a frame that stays with you. We take its mood
            into a wearable silhouette, then print each piece to order.
            Afterhours is our study of the hours between the last page and first
            light.
          </p>
        </div>
      </section>
      <Newsletter />
    </main>
  );
}
