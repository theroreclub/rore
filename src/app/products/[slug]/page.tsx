import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { previewProducts } from "@/lib/preview-catalog";
import { getAvailableVariants } from "@/lib/validations/variants";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductBuyingPanel } from "@/components/products/ProductBuyingPanel";
import { ProductGrid } from "@/components/products/ProductGrid";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const getProduct = cache(async (slug: string) => {
  if (!process.env.DATABASE_URL) return previewProducts.find((product) => product.slug === slug);
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return product;
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
  const variants = getAvailableVariants(product.qikinkVariants);
  const options = variants.map(({ label }) => label);
  const liveCatalogInSandbox = process.env.QIKINK_MODE === "sandbox" && variants.length > 0 && variants.every(option => option.environment === "live");
  const { id, name, description, price, stock, images, category } = product;
  const related = preview
    ? previewProducts.filter((item) => item.id !== product.id)
    : await prisma.product.findMany({
        where: { isActive: true, id: { not: product.id }, categoryId: product.category.id },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true, slug: true } } },
      }).then((items) => items.map((item) => ({
        ...item, stock: getAvailableVariants(item.qikinkVariants).length ? 20 : 0,
      })));

  return (
    <div className="store-shell space-y-10 py-8 pb-16 sm:py-12">
      <Link href="/products" className="store-text-link">All merch</Link>
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <ProductBuyingPanel key={id} product={{ id, slug, name, description, price, stock, images, category }} options={options} preview={preview} />
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
