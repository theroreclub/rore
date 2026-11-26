import Image from "next/image";
import Link from "next/link";
import { CreditCard, Shirt, Truck } from "lucide-react";
import { connection } from "next/server";
import { ProductGrid } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";
import { featuredSlugs, previewProducts } from "@/lib/preview-catalog";
import { getAvailableVariants } from "@/lib/validations/variants";

const collections = [
  { label: "Anime", slug: "anime-oversized", image: "/images/products/shibuya-ghost-tee.webp" },
  { label: "Streetwear", slug: "streetwear", image: "/images/products/hollow-mask-acid-wash-tee.webp" },
  { label: "Accessories", slug: "accessories", image: "/images/products/kanji-distressed-cap.webp" },
  { label: "Fandom", slug: "fandom", image: "/images/products/arcade-night-tee.webp" },
];

async function getFeaturedProducts() {
  if (!process.env.DATABASE_URL) return previewProducts.slice(0, 4);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 16,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });
  const rank = (slug: string) => {
    const index = featuredSlugs.indexOf(slug);
    return index < 0 ? featuredSlugs.length : index;
  };
  return products
    .map((product) => ({ ...product, stock: getAvailableVariants(product.qikinkVariants).length ? 20 : 0 }))
    .sort((a, b) => b.stock - a.stock || rank(a.slug) - rank(b.slug))
    .slice(0, 4);
}

export default async function HomePage() {
  await connection();
  const products = await getFeaturedProducts();

  return (
    <div className="store-home">
      <section className="drop-hero" aria-labelledby="drop-title">
        <Image
          src="/images/off-the-page.webp"
          alt="The charcoal Shibuya Ghost tee laid over ink proofs on a wooden print bench"
          fill
          preload
          sizes="100vw"
          className="drop-hero-image"
        />
        <div className="drop-hero-shade" />
        <div className="store-shell drop-hero-content">
          <h1 id="drop-title" className="display-type">Off the<br /> <em>page.</em></h1>
          <p className="drop-intro">Washed graphic tees, mecha hoodies, and embroidered caps.</p>
          <div className="drop-actions">
            <Link href="/products" className="drop-button drop-button-primary">Shop the drop</Link>
            <Link href="#collections" className="drop-button drop-button-outline">Explore collections</Link>
          </div>
        </div>
      </section>

      <div className="store-perks">
        <div className="store-shell store-perks-inner">
          <span><Shirt aria-hidden="true" /> Made to order</span>
          <span><Truck aria-hidden="true" /> Ships across India</span>
          <span><CreditCard aria-hidden="true" /> Secure Razorpay checkout</span>
        </div>
      </div>

      <section id="featured-drops" className="store-shell store-section">
        <div className="store-section-heading">
          <h2 className="display-type">New arrivals</h2>
          <Link href="/products" className="store-text-link">View all merch</Link>
        </div>
        <ProductGrid products={products} />
      </section>

      <section id="collections" className="store-shell store-section collections-section">
        <div className="store-section-heading">
          <h2 className="display-type">The collections</h2>
        </div>
        <div className="collection-grid">
          {collections.map((collection) => (
            <Link key={collection.slug} href={`/products?category=${collection.slug}`} className="collection-tile">
              <Image src={collection.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" />
              <h3 className="display-type">{collection.label}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
