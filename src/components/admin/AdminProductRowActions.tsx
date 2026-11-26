"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit2, Eye, EyeOff, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toggleProductActive, deleteProduct } from "@/app/actions/admin-products";

interface AdminProductRowActionsProps {
  productId: string;
  productName: string;
  isActive: boolean;
}

export function AdminProductRowActions({
  productId,
  productName,
  isActive,
}: AdminProductRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleProductActive(productId, isActive);
      if (!res.success) {
        alert(res.error || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (!res.success) {
        alert(res.error || "Failed to delete product");
      } else {
        setNotice(res.message || "Done");
        setTimeout(() => {
          setNotice(null);
          setShowConfirm(false);
        }, 3000);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 relative">
      {notice && (
        <div className="absolute right-0 -top-8 z-20 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-rose-400 shadow-xl whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Edit Link */}
      <Link
        href={`/admin/products/${productId}/edit`}
        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        title="Edit product"
      >
        <Edit2 className="w-4 h-4" />
      </Link>

      {/* Visibility Toggle */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`p-1.5 rounded-lg border transition-colors ${
          isActive
            ? "bg-zinc-950 border-zinc-800 text-emerald-400 hover:border-emerald-700/50"
            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
        }`}
        title={isActive ? "Archive product (hide from store)" : "Activate product (show in store)"}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
        ) : isActive ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      {/* Delete / Confirm Button */}
      {showConfirm ? (
        <div className="flex items-center gap-1 bg-zinc-950 border border-rose-900/60 p-1 rounded-xl shadow-lg">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-800 text-white font-bold text-[11px] uppercase transition-colors"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-2 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px] transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/40 text-zinc-400 hover:text-rose-400 transition-colors"
          title={`Delete ${productName}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
