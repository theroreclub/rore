"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterProps {
  categories: CategoryOption[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

export function ProductFilter({
  categories,
  currentCategory,
  currentSearch = "",
  currentSort = "newest",
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const updateFilters = (updates: { category?: string | null; search?: string | null; sort?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.category !== undefined) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }

    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }

    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== "newest") params.set("sort", updates.sort);
      else params.delete("sort");
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = formData.get("search")?.toString().trim();
    updateFilters({ search: searchVal || null });
  };

  return (
    <>
      {/* Sticky Desktop Glass Filter Strip */}
      <div className="sticky top-14 sm:top-16 z-30 mb-8 p-3 sm:p-4 rounded-2xl glass transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          {/* Category Pills (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => updateFilters({ category: null })}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium uppercase tracking-[0.1em] whitespace-nowrap transition-all cursor-pointer ${
                !currentCategory
                  ? "bg-white text-black font-bold shadow-sm"
                  : "glass hover:bg-white/10 text-zinc-300 hover:text-white"
              }`}
            >
              All Drops
            </button>

            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium uppercase tracking-[0.1em] whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-bold shadow-sm"
                      : "glass hover:bg-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Inline Compact Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                name="search"
                defaultValue={currentSearch}
                placeholder="Filter drops..."
                className="w-full pl-9 pr-14 py-1.5 bg-white/[0.06] border border-white/15 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              {currentSearch && (
                <button
                  type="button"
                  onClick={() => updateFilters({ search: null })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Sort Select (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <select
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="h-8 px-3 rounded-full glass text-xs font-sans text-zinc-300 hover:text-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="newest" className="bg-background text-white">Newest First</option>
                <option value="price_asc" className="bg-background text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-background text-white">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile Filter Sheet Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Glass Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Bottom Sheet in .glass-strong */}
          <div className="fixed inset-x-0 bottom-0 glass-strong border-t border-white/20 rounded-t-3xl p-6 space-y-6 z-10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-sans font-bold text-sm uppercase tracking-wider">
                Filter & Sort Drops
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full glass text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Sort By</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: "Newest Releases", value: "newest" },
                  { label: "Price: Low to High", value: "price_asc" },
                  { label: "Price: High to Low", value: "price_desc" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      updateFilters({ sort: s.value });
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-sans transition-colors ${
                      currentSort === s.value ? "bg-white text-black font-bold" : "glass text-zinc-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Category</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateFilters({ category: null });
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-sans text-center transition-colors ${
                    !currentCategory ? "bg-white text-black font-bold" : "glass text-zinc-300"
                  }`}
                >
                  All Drops
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateFilters({ category: cat.slug });
                      setIsMobileFilterOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-sans text-center transition-colors ${
                      currentCategory === cat.slug ? "bg-white text-black font-bold" : "glass text-zinc-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
