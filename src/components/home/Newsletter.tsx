"use client";
import { useState, type FormEvent } from "react";
const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;
export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "error">(
    "idle",
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "busy") return;
    const email = String(
      new FormData(event.currentTarget).get("email") || "",
    ).trim();
    if (!endpoint) {
      setStatus("ok");
      return;
    }
    setStatus("busy");
    try {
      const result = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(12000),
      });
      if (!result.ok) throw new Error("Subscription failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }
  return (
    <section id="newsletter" className="letter atelier-wrap">
      <div>
        <p className="eyebrow">Correspondence</p>
        <h2>The drop letter.</h2>
        <p>Collection releases and notes from the studio, by email.</p>
      </div>
      <form onSubmit={submit} aria-label="Drop letter signup">
        <label htmlFor="drop-email" className="rc-label">
          Email address
        </label>
        <div className="letter-input">
          <input
            id="drop-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            className="rc-input"
            onChange={() => setStatus("idle")}
            disabled={status === "busy"}
          />
          <button
            className="rc-button"
            disabled={status === "busy" || status === "ok"}
          >
            {status === "busy" ? "Joining…" : "Join the list"}
          </button>
        </div>
        <small role="status">
          {status === "ok"
            ? endpoint
              ? "You’re on the list."
              : "Preview complete. Your email was not submitted."
            : status === "error"
              ? "Signup didn’t go through. Please try again."
              : endpoint
                ? "By joining, you agree to receive the drop letter."
                : "Preview form · email collection is offline."}
        </small>
      </form>
    </section>
  );
}
