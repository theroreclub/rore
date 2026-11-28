"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toggleProductActive, deleteProduct } from "@/app/actions/admin-products";

export function AdminProductRowActions({ productId, productName, isActive, editor = false }: {
  productId: string; productName: string; isActive: boolean; editor?: boolean;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const actionStyle = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-sm font-semibold hover:bg-zinc-800";

  function remove() {
    start(async () => {
      try {
        const result = await deleteProduct(productId);
        if (!result.success) { setError(result.error || "Could not delete this product."); return; }
        dialog.current?.close();
        if (editor) router.replace("/admin/products");
        else setNotice(result.softDeleted ? "Hidden from the shop. Order history is preserved." : "Product deleted.");
      } catch { setError("Could not delete the product. Please try again."); }
    });
  }

  function changeVisibility() {
    setNotice("");
    start(async () => {
      try {
        const result = await toggleProductActive(productId, isActive);
        setNotice(result.success ? (isActive ? "Hidden from the shop." : "Published to the shop.") : result.error || "Could not change visibility.");
      } catch { setNotice("Could not change visibility. Please try again."); }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {!editor && <>
          <Link href={`/admin/products/${productId}/edit`} className={actionStyle}><Pencil size={14} />Edit</Link>
          <button type="button" className={actionStyle} disabled={pending} onClick={changeVisibility}>{isActive ? "Hide" : "Publish"}</button>
        </>}
        <button type="button" disabled={pending} aria-haspopup="dialog" className={actionStyle + " text-rose-300"}
          onClick={() => { setError(""); dialog.current?.showModal(); }}><Trash2 size={15} />Delete product</button>
      </div>
      {notice && <p role="status" className="mt-2 text-sm">{notice}</p>}
      <dialog ref={dialog} aria-label={`Delete ${productName}`} onCancel={event => { if (pending) event.preventDefault(); }}
        className="fixed inset-0 m-auto w-full max-w-[min(28rem,90vw)] rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-left text-zinc-100 backdrop:bg-black/70">
        <h2 className="text-xl font-semibold">Delete {productName}?</h2>
        <p className="my-4 text-sm leading-relaxed text-zinc-300">Products with past orders are hidden from the shop so receipts stay available. Products without orders are permanently deleted from RORE CLUB.</p>
        {error && <p role="alert" className="mb-3 text-sm text-rose-300">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" autoFocus disabled={pending} className={actionStyle} onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" disabled={pending} onClick={remove} className="min-h-10 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-white">{pending ? "Removing…" : "Confirm deletion"}</button>
        </div>
      </dialog>
    </div>
  );
}
