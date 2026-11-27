import { parse } from "csv-parse/sync";
import { z } from "zod";
import { variantsSchema } from "@/lib/validations/variants";
import { rupeesToPaise } from "@/lib/utils";

const rowSchema = z.object({
  qikink_product_id: z.string().regex(/^[1-9]\d{0,17}$/, "Enter the numeric My Products design ID."),
  title: z.string().min(2).max(100),
  price_rupees: z.string().regex(/^\d+(?:\.\d{1,2})?$/, "Use a rupee amount such as 799.").transform(Number).pipe(z.number().min(0.01).max(21474836)),
  color: z.string().max(40),
  size: z.string().min(1).max(40),
  store_sku: z.string().min(1),
  product_sku: z.string().max(120).optional(),
});

export function readCatalogCsv(text: string) {
  const rows: string[][] = parse(text, { bom: true, trim: true, skip_empty_lines: true, max_record_size: 8192 });
  const headers = rows.shift()?.map(header => header.trim().toLowerCase()) ?? [];
  if (!rows.length || rows.length > 1000) throw new Error("Import between 1 and 1,000 data rows at a time.");
  const summaryHeaders = ["product id", "products", "selling price"];
  if (summaryHeaders.every(key => headers.includes(key))) {
    const [idColumn, productColumn, priceColumn] = summaryHeaders.map(key => headers.indexOf(key));
    const ids = new Set<string>();
    return rows.map((cells, index) => {
      const qikinkProductId = cells[idColumn].trim();
      const name = cells[productColumn].trim().split(/\r?\n|\s{2,}/, 1)[0].trim();
      const prices = cells[priceColumn].trim().match(/^(\d+(?:\.\d{1,2})?)(?:\s*[-–]\s*(\d+(?:\.\d{1,2})?))?$/);
      if (!rowSchema.shape.qikink_product_id.safeParse(qikinkProductId).success ||
          !rowSchema.shape.title.safeParse(name).success || !prices || ids.has(qikinkProductId)) {
        throw new Error(`Row ${index + 2}: check the design ID, product name and selling price. Each design ID must appear once in a My Products export.`);
      }
      const low = rowSchema.shape.price_rupees.safeParse(prices[1]);
      const high = rowSchema.shape.price_rupees.safeParse(prices[2] ?? prices[1]);
      if (!low.success || !high.success || high.data < low.data) throw new Error(`Row ${index + 2}: invalid selling price.`);
      ids.add(qikinkProductId);
      return { qikinkProductId, name, price: low.data === high.data ? rupeesToPaise(low.data) : 0, qikinkVariants: [] };
    });
  }
  const required = ["qikink_product_id", "title", "price_rupees", "color", "size", "store_sku"];
  if (!required.every(key => headers.includes(key)) || new Set(headers).size !== headers.length) {
    throw new Error("Upload a Qikink My Products export with Product ID, Products and Selling Price, or use the variant template.");
  }
  type Option = z.infer<typeof variantsSchema>[number];
  const products = new Map<string, { qikinkProductId: string; name: string; price: number; qikinkVariants: Option[] }>();
  const storeSkus = new Set<string>();
  for (const [index, cells] of rows.entries()) {
    const parsed = rowSchema.safeParse(Object.fromEntries(headers.map((key, i) => [key, cells[i]?.trim()])));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`Row ${index + 2}, ${issue.path.join(".")}: ${issue.message}`);
    }
    const row = parsed.data;
    const price = rupeesToPaise(row.price_rupees);
    const product = products.get(row.qikink_product_id) ?? {
      qikinkProductId: row.qikink_product_id, name: row.title, price, qikinkVariants: [],
    };
    if (product.name !== row.title || product.price !== price) throw new Error(`Row ${index + 2}: use one title and retail price per design.`);
    if (storeSkus.has(row.store_sku)) throw new Error(`Row ${index + 2}: Store SKU already appears in this file.`);
    storeSkus.add(row.store_sku);
    product.qikinkVariants.push({ label: [row.color, row.size].filter(Boolean).join(" - "), sku: row.store_sku,
      ...(row.product_sku ? { blankSku: row.product_sku } : {}), environment: "live" });
    products.set(row.qikink_product_id, product);
  }
  for (const product of products.values()) {
    if (!variantsSchema.safeParse(product.qikinkVariants).success) throw new Error(`Check option labels and SKUs for design ${product.qikinkProductId}. Each design supports 100 unique options.`);
  }
  return Array.from(products.values());
}
