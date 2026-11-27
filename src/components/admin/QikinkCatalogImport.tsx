"use client";

import { useActionState } from "react";
import { importQikinkProducts } from "@/app/actions/qikink-import";

export function QikinkCatalogImport({ categories }: { categories: { id: string; name: string }[] }) {
  const [message, action, pending] = useActionState(importQikinkProducts, "");
  return (
    <details className="border p-4">
      <summary className="cursor-pointer font-semibold">Import Qikink designs</summary>
      <form action={action} className="mt-4 grid max-w-xl gap-4">
        <p className="text-sm text-zinc-300">
          Upload your CSV directly from Qikink My Products to create drafts with their names and selling prices.
          Add photos, a description and the Store SKU for each size and colour before publishing.
          If Qikink lists a price range, choose a retail price in the editor.
        </p>
        <p className="text-sm text-zinc-300">
          To include variant SKUs in the import, use the{" "}
          <a href="/qikink-import-template.csv" download className="underline">variant CSV template</a>.
        </p>
        <label>Category <select className="block bg-zinc-900 p-2" name="categoryId" required>
          {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select></label>
        <label>Design CSV <input className="block mt-1" name="file" type="file" accept=".csv,text/csv" required /></label>
        <button className="drop-button drop-button-primary justify-self-start" disabled={pending}>{pending ? "Importing…" : "Import as drafts"}</button>
        {message && <p role="status">{message}</p>}
      </form>
    </details>
  );
}
