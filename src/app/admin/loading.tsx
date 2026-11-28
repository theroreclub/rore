import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return <section role="status" aria-label="Loading admin page" className="space-y-4">
    <Skeleton className="h-9 w-48" />
    {[0, 1, 2].map(row => <Skeleton key={row} className="h-28 w-full rounded-xl" />)}
  </section>;
}
