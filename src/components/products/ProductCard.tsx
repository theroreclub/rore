import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    category?: { name: string; slug: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="merch-card group">
      <div className="merch-card-image">
        <Image
          src={product.images[0] || "/images/products/placeholder.svg"}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && <span className="merch-card-status">Unavailable</span>}
      </div>
      <div className="merch-card-body">
        {product.category && <p>{product.category.name}</p>}
        <h3>{product.name}</h3>
        <span>{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
