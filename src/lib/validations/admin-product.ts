import { z } from "zod";
import { variantsSchema } from "./variants";
import { isProductImage } from "./product-image";

export const adminProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and hyphens only (e.g. cyber-hoodie)"
    ),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(3000, "Description is too long"),
  priceInRupees: z
    .coerce
    .number()
    .min(0.01).max(21474836).multipleOf(0.01),
  salePriceInRupees: z.number().min(0.01).max(21474836).multipleOf(0.01).nullable().optional(),
  stock: z
    .coerce
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Please select a category"),
  isActive: z.boolean().default(true),
  qikinkVariants: variantsSchema.default([]),
  images: z
    .array(z.string().max(2048).refine(isProductImage, "Upload the photo or use a supported image URL."))
    .min(1, "Please provide at least one product image"),
}).refine(product => product.salePriceInRupees == null || product.salePriceInRupees < product.priceInRupees, {
  message: "Sale price must be lower than the regular price.",
  path: ["salePriceInRupees"],
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
