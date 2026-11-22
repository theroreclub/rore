import { StageThumbnail } from "../StageThumbnail";
import { inr, type CartLine } from "@/lib/catalog";
export const deliveryFee = 60; // Preview only. Replace with a server-validated shipping quote.
export function Summary({
  lines,
  total,
}: {
  lines: CartLine[];
  total: number;
}) {
  return (
    <aside className="rc-glass order-summary">
      <p className="eyebrow">Your selection</p>
      <h2>Order summary</h2>
      {lines.map((l) => (
        <div className="summary-piece" key={l.variantId}>
          <StageThumbnail src={l.image} size={60} />
          <div>
            <strong>{l.p.name}</strong>
            <small>
              {l.color} / {l.label} · Qty {l.quantity}
            </small>
          </div>
          <span>{inr(l.quantity * l.p.price)}</span>
        </div>
      ))}
      <dl className="bill">
        <div>
          <dt>Subtotal</dt>
          <dd>{inr(total)}</dd>
        </div>
        <div>
          <dt>Standard delivery · preview</dt>
          <dd>{inr(deliveryFee)}</dd>
        </div>
        <div>
          <dt>Preview total</dt>
          <dd>{inr(total + deliveryFee)}</dd>
        </div>
      </dl>
    </aside>
  );
}
