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
  const actionStyle = "row-action";

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
      <div className="admin-actions">
        {!editor && <>
          <Link href={`/admin/products/${productId}/edit`} className={actionStyle}><Pencil size={14} />Edit</Link>
          <button type="button" className={actionStyle} disabled={pending} onClick={changeVisibility}>{isActive ? "Hide" : "Publish"}</button>
        </>}
        <button type="button" disabled={pending} aria-haspopup="dialog" className={actionStyle + " danger"}
          onClick={() => { setError(""); dialog.current?.showModal(); }}><Trash2 size={15} />Delete product</button>
      </div>
      {notice && <p role="status" className="mt-2 text-sm">{notice}</p>}
      <dialog ref={dialog} aria-label={`Delete ${productName}`} onCancel={event => { if (pending) event.preventDefault(); }}
        className="fixed inset-0 m-auto w-full max-w-[min(28rem,90vw)] rounded-lg border border-slate-200 bg-[#fff] p-6 text-left text-slate-900 backdrop:bg-black/70">
        <h2 className="text-xl font-semibold">Delete {productName}?</h2>
        <p className="my-4 text-sm leading-relaxed text-slate-700">Products with past orders are hidden from the shop so receipts stay available. Products without orders are permanently deleted from RORE CLUB.</p>
        {error && <p role="alert" className="mb-3 text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" autoFocus disabled={pending} className={actionStyle} onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" disabled={pending} onClick={remove} className="min-h-10 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-slate-50">{pending ? "Removing…" : "Confirm deletion"}</button>
        </div>
      </dialog>
    </div>
  );
}
