import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 mb-6">
        <PackageX className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
        ARCHIVED // PIECE NOT FOUND
      </span>
      <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight">
        Product Not Available
      </h1>
      <p className="text-sm text-zinc-400 mt-3 max-w-md">
        This drop may have concluded, been archived, or the slug is incorrect. Check our active drops catalog.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-bold tracking-wider uppercase transition-all shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to All Drops
      </Link>
    </div>
  );
}
