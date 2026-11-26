"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { getVariants } from "@/lib/validations/variants";

export async function applyStockReport(_previous: string, data: FormData): Promise<string> {
  await requireAdminSession();
  const raw = data.get("skus");
  if (typeof raw !== "string" || raw.length > 100000) return "Enter the SKU column from the report.";
  const skus = raw.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (skus[0]?.toLowerCase() === "sku") skus.shift();
  if (skus.some(sku => !/^[\w.-]{1,120}$/.test(sku))) return "Paste only the SKU column, one code per line.";
  if (!skus.length && data.get("empty") !== "on") return "Confirm that Qikink’s report has no entries before clearing existing stock holds.";
  const reported = new Set(skus.map(sku => sku.toLowerCase()));
  try {
    const result = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ select: { id: true, updatedAt: true, qikinkVariants: true } });
      let held = 0, changed = 0, mapped = 0;
      for (const product of products) {
        let modified = false;
        const variants = getVariants(product.qikinkVariants).map(option => {
          if (!option.blankSku) return option;
          mapped++;
          const unavailable = reported.has(option.blankSku.toLowerCase());
          if (unavailable) held++;
          if (unavailable === Boolean(option.unavailable)) return option;
          modified = true;
          changed++;
          return { ...option, unavailable };
        });
        if (modified) await tx.product.update({
          where: { id: product.id, updatedAt: product.updatedAt }, data: { qikinkVariants: variants },
        });
      }
      return { mapped, held, changed };
    }, { isolationLevel: "Serializable", timeout: 30000 });
    revalidatePath("/", "layout");
    return `Checked ${result.mapped} mapped variants. ${result.held} unavailable. ${result.changed} changed.`;
  } catch {
    return "The stock report could not be applied. Refresh and try again.";
  }
}
