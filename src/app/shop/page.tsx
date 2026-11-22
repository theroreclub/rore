import { Suspense } from "react";
import { collection } from "@/lib/catalog";
import { ShopListing } from "@/components/shop/ShopListing";
import ShopLoading from "./loading";
export const metadata = { title: "Shop the collection — RORECLUB" };
export default function Shop() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopListing products={collection} />
    </Suspense>
  );
}
