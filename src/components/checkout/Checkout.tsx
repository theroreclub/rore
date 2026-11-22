"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useShop } from "../layout/Storefront";
import { Summary } from "./Summary";
const steps = ["Contact", "Delivery", "Review"] as const;
const initial = {
  name: "",
  email: "",
  street: "",
  city: "",
  region: "",
  pin: "",
};
type Field = keyof typeof initial;
const fields: Record<Field, [string, string]> = {
  name: ["Full name", "name"],
  email: ["Email address", "email"],
  street: ["Street address", "street-address"],
  city: ["City", "address-level2"],
  region: ["State or union territory", "address-level1"],
  pin: ["PIN code", "postal-code"],
};
export function Checkout() {
  const { lines, total, loaded } = useShop();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [details, setDetails] = useState(initial);
  const heading = useRef<HTMLHeadingElement>(null),
    first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus();
  }, [step, done]);
  if (!loaded)
    return (
      <main className="atelier atelier-wrap shop-view" aria-busy="true">
        <p role="status">Loading your bag…</p>
      </main>
    );
  if (done)
    return (
      <main className="atelier atelier-wrap shop-view">
        <p className="eyebrow">Checkout preview</p>
        <h1 tabIndex={-1} ref={heading}>
          Review complete.
        </h1>
        <p className="description">
          No payment was taken or order submitted. Your bag is saved for this
          browser.
        </p>
        <Link className="rc-button" href="/shop/">
          Return to the collection
        </Link>
      </main>
    );
  if (!lines.length)
    return (
      <main className="atelier atelier-wrap shop-view">
        <h1>Your bag is empty.</h1>
        <p className="description">
          Choose a piece from the collection to preview checkout.
        </p>
        <Link href="/shop/" className="rc-button">
          Shop the collection
        </Link>
      </main>
    );
  function field(key: Field) {
    const [label, autoComplete] = fields[key];
    return (
      <label key={key} className="form-field">
        {label}
        <input
          className="rc-input"
          name={key}
          required
          value={details[key]}
          autoComplete={autoComplete}
          type={key === "email" ? "email" : "text"}
          inputMode={key === "pin" ? "numeric" : undefined}
          maxLength={key === "pin" ? 6 : 160}
          pattern={
            key === "pin"
              ? "[1-9][0-9]{5}"
              : key === "email"
                ? undefined
                : ".*\\S.*"
          }
          title={
            key === "pin" ? "Enter a six-digit Indian PIN code" : undefined
          }
          onChange={(e) => setDetails({ ...details, [key]: e.target.value })}
        />
      </label>
    );
  }
  return (
    <main className="checkout atelier-wrap shop-view">
      <p className="eyebrow">RORECLUB / Checkout preview</p>
      <h1>Checkout.</h1>
      <p className="checkout-hint">
        Preview only. Use sample contact and delivery details. Nothing entered
        here is submitted.
      </p>
      <ol className="step-list" aria-label="Checkout steps">
        {steps.map((s, i) => (
          <li key={s} aria-current={step === i ? "step" : undefined}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>
      <div className="checkout-grid">
        <section className="checkout-form">
          <h2 tabIndex={-1} ref={heading}>
            {
              ["Contact details", "Delivery details", "Review your details"][
                step
              ]
            }
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else {
                setDone(true);
                setDetails(initial);
              }
            }}
          >
            {step === 0 && (
              <>
                {field("name")}
                {field("email")}
              </>
            )}
            {step === 1 && (
              <>
                {field("street")}
                <div className="field-pair">
                  {field("city")}
                  {field("pin")}
                </div>
                {field("region")}
                <p className="delivery-note">
                  Standard delivery within India · preview rate
                </p>
              </>
            )}
            {step === 2 && (
              <div className="review-fields">
                <div>
                  <h3>Contact</h3>
                  <p>
                    {details.name}
                    <br />
                    {details.email}
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setStep(0)}
                  >
                    Edit contact
                  </button>
                </div>
                <div>
                  <h3>Delivery</h3>
                  <p>
                    {details.street}
                    <br />
                    {details.city}, {details.region} {details.pin}
                    <br />
                    India
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setStep(1)}
                  >
                    Edit delivery
                  </button>
                </div>
              </div>
            )}
            <div className="check-actions">
              {step > 0 && (
                <button
                  className="rc-button"
                  data-tone="quiet"
                  type="button"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
              <button className="rc-button">
                {
                  ["Continue to delivery", "Review details", "Finish preview"][
                    step
                  ]
                }
              </button>
            </div>
          </form>
        </section>
        <Summary lines={lines} total={total} />
      </div>
    </main>
  );
}
