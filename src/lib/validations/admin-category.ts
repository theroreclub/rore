import { z } from "zod";

export const adminCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(50, "Slug cannot exceed 50 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens (e.g., streetwear-drops)."
    ),
  description: z.string().trim().max(300, "Description cannot exceed 300 characters.").optional(),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
