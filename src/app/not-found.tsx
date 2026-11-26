import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 mb-6 shadow-xl shadow-rose-950/20">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
        404 // ROUTE NOT FOUND
      </span>
      <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight">
        LOST IN THE MATRIX
      </h1>
      <p className="text-sm text-zinc-400 mt-3 max-w-md leading-relaxed">
        The drop or page you are looking for does not exist or has been shifted into another dimension.
      </p>
      <div className="flex items-center gap-4 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-bold tracking-wider uppercase transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-sm font-bold tracking-wider uppercase transition-all"
        >
          View All Drops
        </Link>
      </div>
    </div>
  );
}
