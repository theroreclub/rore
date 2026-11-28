import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicProducts } from "@/lib/public-catalog";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductBuyingPanel } from "@/components/products/ProductBuyingPanel";
import { ProductGrid } from "@/components/products/ProductGrid";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const getProduct = cache(async (slug: string) => {
  return (await publicProducts()).find(product => product.slug === slug);
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return product
    ? { title: `${product.name} | RORE CLUB`, description: product.description.slice(0, 160) }
    : { title: "Product unavailable | RORE CLUB" };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const preview = !process.env.DATABASE_URL;
  const { id, name, description, price, regularPrice, stock, images, category, options } = product;
  const liveCatalogInSandbox = process.env.QIKINK_MODE === "sandbox" && product.liveVariants;
  const related = (await publicProducts()).filter(item =>
    item.id !== id && (preview || item.category.slug === category.slug)
  ).slice(0, 4);

  return (
    <div className="store-shell space-y-10 py-8 pb-16 sm:py-12">
      <Link href="/products" className="store-text-link">All merch</Link>
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <ProductBuyingPanel key={id} product={{ id, slug, name, description, price, regularPrice, stock, images, category }} options={options} preview={preview} />
          {liveCatalogInSandbox && <p className="mt-4 text-sm text-zinc-300">You can save this item to your bag. Checkout opens when the store goes live.</p>}
        </div>
      </div>
      {related.length > 0 && (
        <section className="space-y-5 border-t pt-8">
          <h2 className="display-type text-4xl uppercase">More to explore</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
