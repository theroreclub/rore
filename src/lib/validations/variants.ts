import { z } from "zod";

export const variantLabel = z.string().trim().min(1).max(80);
export const variantsSchema = z.array(z.object({
  label: variantLabel,
  sku: z.string().trim().min(1).max(120).regex(/^[\w.-]+$/, "Enter a valid Qikink SKU."),
  blankSku: z.string().trim().min(1).max(120).optional(),
  unavailable: z.boolean().optional(),
  environment: z.enum(["live", "sandbox"]).optional(),
})).max(100).refine(
  (variants) => new Set(variants.map(({ label }) => label.toLowerCase())).size === variants.length &&
    new Set(variants.map(({ sku }) => sku)).size === variants.length,
  "Each Qikink option needs a unique label and SKU."
);

export function getVariants(value: unknown) {
  const parsed = variantsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function getCartItemLimit(product: { stock: number; qikinkVariants?: unknown }, variant: string) {
  const options = getVariants(product.qikinkVariants);
  if (options.length) return options.some((option) => option.label === variant && !option.unavailable) ? 20 : 0;
  return variant ? 0 : Math.min(product.stock, 20);
}

export function getAvailableVariants(value: unknown) {
  return getVariants(value).filter((option) => !option.unavailable);
}
