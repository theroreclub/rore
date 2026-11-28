"use client";

import { useActionState } from "react";
import { applyStockReport } from "@/app/actions/qikink-stock";

export function QikinkStockReport() {
  const [message, action, pending] = useActionState(applyStockReport, "");
  return (
      <form action={action} className="mt-4 grid max-w-xl gap-3">
        <label htmlFor="stock-skus">Paste the complete SKU column from Qikink’s No Stock Report.</label>
        <p className="text-sm text-slate-600">Matching sizes and colours become unavailable. Previously held variants return to sale when their SKU leaves the report.</p>
        <textarea id="stock-skus" name="skus" rows={4} maxLength={100000} className="border bg-transparent p-2 font-mono" />
        <label className="text-sm"><input type="checkbox" name="empty" /> Qikink’s report is empty.</label>
        <button disabled={pending} className="drop-button drop-button-primary justify-self-start">{pending ? "Updating…" : "Apply stock report"}</button>
        <p role="status">{message}</p>
      </form>
  );
}
