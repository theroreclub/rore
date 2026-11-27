"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { readCatalogCsv } from "@/lib/qikink/catalog-import";

export async function importQikinkProducts(_previous: string, data: FormData) {
  await requireAdminSession();
  if (process.env.QIKINK_MODE !== "live") return "The catalog import requires the live Qikink store.";
  const file = data.get("file");
  const categoryId = data.get("categoryId");
  if (!(file instanceof File) || !file.size || file.size > 512000) return "Choose a CSV file up to 500 KB.";
  if (typeof categoryId !== "string" || !categoryId) return "Choose a category for these designs.";
  let designs;
  try {
    designs = readCatalogCsv(await file.text());
  } catch (error) {
    return error instanceof Error ? error.message.slice(0, 250) : "Check the CSV format.";
  }
  try {
    const imported = await prisma.product.createMany({
      data: designs.map(product => ({
        ...product, slug: `qikink-${product.qikinkProductId}`, description: "", categoryId,
        images: [], isActive: false,
      })), skipDuplicates: true,
    });
    revalidatePath("/admin/products");
    return `Imported ${imported.count} draft(s). Skipped ${designs.length - imported.count} existing design(s). Open each draft to review its details and Store SKUs before publishing.`;
  } catch {
    return "Could not save these drafts. Check the category and try again.";
  }
}
