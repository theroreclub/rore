import { StageThumbnail } from "../StageThumbnail";
import Link from "next/link";
import { Check, Minus, Plus, Trash2, X } from "lucide-react";
import { type CartLine, type Product, inr, productPath } from "@/lib/catalog";
export function BagContents({
  lines,
  total,
  message,
  changeQuantity,
  close,
}: {
  lines: CartLine[];
  total: number;
  message: string;
  changeQuantity: (id: string, delta: number) => void;
  close: () => void;
}) {
  return (
    <>
      <div className="section-kicker">
        <i /> YOUR SELECTION
      </div>
      <h2 id="panel-title">
        Your bag<span>.</span>
      </h2>
      {message && (
        <p role="status" className="feedback">
          <Check size={15} /> {message}
        </p>
      )}
      {lines.length ? (
        <>
          <div className="bag-list">
            {lines.map((l) => (
              <div className="line" key={l.variantId}>
                <StageThumbnail src={l.image} size={70} />
                <div className="line-details">
                  <Link
                    onNavigate={close}
                    className="bag-piece"
                    href={productPath(l.p)}
                  >
                    {l.p.name}
                  </Link>
                  <small>
                    {l.color} / {l.label}
                  </small>
                  <div className="qty">
                    <button
                      aria-label={"Decrease " + l.p.name + " quantity"}
                      onClick={() => changeQuantity(l.variantId, -1)}
                    >
                      <Minus size={13} />
                    </button>
                    {l.quantity}
                    <button
                      disabled={l.quantity >= 99}
                      aria-label={"Increase " + l.p.name + " quantity"}
                      onClick={() => changeQuantity(l.variantId, 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <div className="line-end">
                  {inr(l.p.price * l.quantity)}
                  <button
                    className="icon-button"
                    aria-label={"Remove " + l.p.name}
                    onClick={() => changeQuantity(l.variantId, -l.quantity)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="subtotal">
            <b>Preview subtotal</b>
            <b>{inr(total)}</b>
          </div>
          <p>
            These pieces are part of a design preview. Ordering opens with the
            live collection.
          </p>
        </>
      ) : (
        <p>
          Your bag is empty. Pick a piece and choose your size to start your
          edit.
        </p>
      )}
      {lines.length > 0 && (
        <Link href="/checkout/" className="rc-button" onNavigate={close}>
          Preview checkout
        </Link>
      )}
      <button className="text-link drawer-continue" onClick={close}>
        Continue browsing
      </button>
    </>
  );
}
export function SavedContents({
  products,
  saved,
  toggleSaved,
  close,
}: {
  products: Product[];
  saved: string[];
  toggleSaved: (id: string) => void;
  close: () => void;
}) {
  return (
    <>
      <div className="section-kicker">
        <i /> YOUR EDIT
      </div>
      <h2 id="panel-title">
        Saved pieces<span>.</span>
      </h2>
      {!saved.length && (
        <p>Tap the bookmark on a piece to keep it here for later.</p>
      )}
      {products
        .filter((p) => saved.includes(p.id))
        .map((p) => (
          <div className="line" key={p.id}>
            <StageThumbnail src={p.image} size={70} />
            <Link
              onNavigate={close}
              className="saved-name"
              href={productPath(p)}
            >
              {p.name}
              <small>{inr(p.price)}</small>
            </Link>
            <button
              className="icon-button"
              aria-label={"Unsave " + p.name}
              onClick={() => toggleSaved(p.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      <Link
        className="secondary"
        href="/shop/"
        onNavigate={() => {
          close();
        }}
      >
        Browse the drop
      </Link>
    </>
  );
}
