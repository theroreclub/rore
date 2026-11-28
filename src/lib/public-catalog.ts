import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./prisma";
import { previewCategories, previewProducts } from "./preview-catalog";
import { getAvailableVariants } from "./validations/variants";

export const catalogTag = "public-store-catalog";

export async function publicProducts() {
  "use cache";
  cacheLife("minutes");
  cacheTag(catalogTag);
  const preview = !process.env.DATABASE_URL;
  const products = preview ? previewProducts : await prisma.product.findMany({
    where: { isActive: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true, slug: true, name: true, description: true, price: true, regularPrice: true,
      images: true, stock: true, qikinkVariants: true,
      category: { select: { name: true, slug: true } },
    },
  });
  return products.map(({ qikinkVariants, stock, ...product }) => {
    const options = getAvailableVariants(qikinkVariants);
    return { ...product, stock: preview ? stock : options.length ? 20 : 0,
      options: options.map(option => option.label),
      liveVariants: options.length > 0 && options.every(option => option.environment === "live"),
    };
  });
}

export async function publicCategories() {
  "use cache";
  cacheLife("minutes");
  cacheTag(catalogTag);
  return process.env.DATABASE_URL ? prisma.category.findMany({
    select: { id: true, name: true, slug: true }, orderBy: { name: "asc" },
  }) : previewCategories;
}
