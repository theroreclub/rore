import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="shop-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Skeleton className="h-4 w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: Image skeleton */}
        <div className="w-full aspect-square rounded-lg border border-shop-rule bg-shop-card p-4">
          <Skeleton className="w-full h-full rounded-md" />
        </div>

        {/* Right: Info skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-36" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-14 w-full rounded-md mt-8" />
        </div>
      </div>
    </div>
  );
}
