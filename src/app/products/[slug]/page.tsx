import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { conceptCatalog, collection } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return conceptCatalog.map(({ slug }) => ({ slug }));
}
function findProduct(slug: string) {
  return conceptCatalog.find((product) => product.slug === slug) ?? notFound();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = findProduct((await params).slug);
  return {
    title: product.name + " — Rore Club",
    description: product.description,
  };
}
export default async function ProductPage({ params }: Props) {
  const product = findProduct((await params).slug);
  return (
    <ProductDetail
      key={product.id}
      product={product}
      related={collection
        .filter((p) => p.id !== product.id)
        .sort(
          (a, b) =>
            Number(b.kind === product.kind) - Number(a.kind === product.kind),
        )
        .slice(0, 3)}
    />
  );
}
