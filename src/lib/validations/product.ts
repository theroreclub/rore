import { z } from "zod";

/**
 * Schema for validating product filtering, search, and pagination query params on the server.
 */
export const productSearchParamsSchema = z.object({
  category: z
    .string()
    .trim()
    .max(50, "Category filter is too long")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  search: z
    .string()
    .trim()
    .max(100, "Search query too long")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export type ProductSearchParams = z.infer<typeof productSearchParamsSchema>;
