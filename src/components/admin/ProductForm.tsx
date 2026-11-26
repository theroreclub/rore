"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { AdminProductInput } from "@/lib/validations/admin-product";
import { getVariants, variantsSchema } from "@/lib/validations/variants";
import { paiseToRupees } from "@/lib/utils";
import { ProductImageUploader } from "./ProductImageUploader";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number; // in paise
    stock: number;
    categoryId: string;
    isActive: boolean;
    images: string[];
    qikinkVariants: unknown;
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditing);
  const [description, setDescription] = useState(initialData?.description || "");
  const [priceInRupees, setPriceInRupees] = useState<string | number>(
    initialData ? paiseToRupees(initialData.price) : ""
  );
  const [stock, setStock] = useState<string | number>(initialData?.stock ?? 0);
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [variantRows, setVariantRows] = useState(() =>
    getVariants(initialData?.qikinkVariants).map(({ label, sku, blankSku }) => [label, sku, blankSku].filter(Boolean).join(" | ")).join("\n")
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const variants = variantsSchema.safeParse(
      variantRows.split("\n").filter((line) => line.trim()).map((line) => {
        const [label, sku, blankSku, extra] = line.split("|");
        return { label, sku: extra === undefined ? sku : undefined, blankSku: blankSku?.trim() || undefined };
      })
    );
    if (!variants.success) {
      setError("Enter each Qikink option as Label | SKU. Labels and SKUs must be unique.");
      return;
    }
    setIsSaving(true);
    setError(null);

    const payload: AdminProductInput = {
      name,
      slug,
      description,
      priceInRupees: Number(priceInRupees),
      stock: Number(stock),
      categoryId,
      isActive,
      images,
      qikinkVariants: variants.data,
    };

    try {
      const res = isEditing
        ? await updateProduct(initialData.id, payload)
        : await createProduct(payload);

      if (!res.success) {
        setError(res.error || "Failed to save product.");
        setIsSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Save product error:", err);
      setError("An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Products
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? "Update Drop" : "Publish Drop"}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid gap-2 rounded-2xl border p-5">
        <label htmlFor="qikink-variants" className="font-semibold">Qikink product options</label>
        <p id="qikink-variants-help" className="text-sm text-zinc-400">
          In Qikink Product Variations, copy one option per line as Label | Store SKU | Product SKU. The last field matches the No Stock Report. For a product with one option, use One size as its label.
        </p>
        <textarea
          id="qikink-variants"
          aria-describedby="qikink-variants-help"
          className="min-h-28 rounded-lg border bg-zinc-950 p-3 font-mono text-sm"
          value={variantRows}
          onChange={(event) => setVariantRows(event.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Main Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
          Product Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
              Drop Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Cyber Acid Wash Hoodie"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManuallyEdited(true);
              }}
              placeholder="cyber-acid-wash-hoodie"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
            Description & Specifications *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fabric weight, GSM, silhouette drape, wash details..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
              Price (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                ₹
              </span>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={priceInRupees}
                onChange={(e) => setPriceInRupees(e.target.value)}
                placeholder="2499"
                className="w-full pl-8 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Auto-stored in paise (e.g. ₹2,499 = 249900 paise)
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              required
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="30"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-rose-600 focus:ring-0"
          />
          <label htmlFor="isActive" className="text-xs font-bold text-zinc-300 cursor-pointer">
            Drop is Active (Visible on storefront & search catalog)
          </label>
        </div>
      </div>

      {/* Media Uploader Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80">
        <ProductImageUploader images={images} onChange={setImages} />
      </div>
    </form>
  );
}
