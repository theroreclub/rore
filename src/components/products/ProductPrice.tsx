import { formatPrice } from "@/lib/utils";

export function ProductPrice({ price, regularPrice }: { price: number; regularPrice?: number | null }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      {regularPrice && regularPrice > price && (
        <del className="text-sm font-normal opacity-70">
          <span className="sr-only">Regular price </span>{formatPrice(regularPrice)}
        </del>
      )}
      {regularPrice && regularPrice > price && <span className="sr-only">Sale price </span>}
      {formatPrice(price)}
    </span>
  );
}
