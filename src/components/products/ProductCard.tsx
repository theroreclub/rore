import Image from "next/image";
import Link from "next/link";
import { ProductPrice } from "./ProductPrice";
import { WishlistHeart } from "./Wishlist";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    regularPrice?: number | null;
    stock: number;
    images: string[];
    category?: { name: string; slug: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="merch-card group">
      <Link href={`/products/${product.slug}`} className="block h-full">
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
          <ProductPrice price={product.price} regularPrice={product.regularPrice} />
        </div>
      </Link>
      <WishlistHeart id={product.id} name={product.name} />
    </article>
  );
}
