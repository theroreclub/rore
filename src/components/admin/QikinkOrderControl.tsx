"use client";

import { useState } from "react";
import { manageQikinkOrder } from "@/app/actions/admin-orders";

interface Props {
  orderId: string;
  reference: string;
  environment: string | null;
  providerId: string | null;
  status: string | null;
  error: string | null;
  canSend: boolean;
  needsReview: boolean;
}

export function QikinkOrderControl({ orderId, reference, environment, providerId, status, error, canSend, needsReview }: Props) {
  const [manualId, setManualId] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  async function run(action: "send" | "refresh") {
    setWorking(true);
    try {
      const result = await manageQikinkOrder(orderId, action, manualId || undefined);
      setMessage(result.message);
    } catch {
      setMessage("Could not update fulfillment.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-2xl border p-5">
      <h2 className="font-bold">Qikink fulfillment</h2>
      <p className="text-sm text-zinc-300">{status || "Awaiting captured payment"} · {environment} · Reference <strong>{reference}</strong></p>
      {providerId && <p className="text-sm text-zinc-300">Qikink order {providerId}</p>}
      {error && <p className="text-sm text-amber-300">{error}</p>}
      {needsReview && (
        <label className="grid max-w-md gap-2 text-sm">
          Find this reference in the Qikink dashboard and enter its existing order ID.
          <input type="text" inputMode="numeric" value={manualId} onChange={(event) => setManualId(event.target.value)} className="rounded-lg border bg-zinc-950 p-2" />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {canSend && <button disabled={working} type="button" onClick={() => run("send")} className="drop-button drop-button-primary">Send to Qikink</button>}
        {(providerId || needsReview) && (
          <button disabled={working || (!providerId && !manualId.trim())} type="button" onClick={() => run("refresh")} className="drop-button drop-button-outline disabled:opacity-50">
            {needsReview ? "Link existing order" : "Refresh status"}
          </button>
        )}
      </div>
      {message && <p className="text-sm" role="status">{message}</p>}
    </section>
  );
}
