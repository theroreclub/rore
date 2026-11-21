import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DropRoom from "@/components/DropRoom";
import { conceptCatalog } from "@/lib/catalog";

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
  return <DropRoom products={conceptCatalog} product={product} />;
}
