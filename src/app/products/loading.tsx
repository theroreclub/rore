import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="shop-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-full bg-white/[0.08]" />
        <Skeleton className="h-10 w-64 rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-96 max-w-full rounded-full bg-white/[0.08]" />
      </div>

      {/* Filter Strip Skeleton */}
      <div className="p-4 rounded-md glass flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full bg-white/[0.08]" />
          <Skeleton className="h-8 w-28 rounded-full bg-white/[0.08]" />
          <Skeleton className="h-8 w-36 rounded-full bg-white/[0.08]" />
        </div>
        <Skeleton className="h-8 w-48 rounded-full bg-white/[0.08]" />
      </div>

      {/* Product Cards 4:5 Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md glass overflow-hidden space-y-4 p-4"
          >
            <Skeleton className="aspect-[4/5] w-full rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-5 w-3/4 rounded-md bg-white/[0.08]" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-20 rounded-md bg-white/[0.08]" />
              <Skeleton className="h-4 w-16 rounded-md bg-white/[0.08]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
