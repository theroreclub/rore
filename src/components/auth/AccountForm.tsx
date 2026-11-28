"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { signUpUser } from "@/app/actions/auth";
import { returnPath } from "@/lib/return-path";

export function AccountForm({ signup = false }: { signup?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const destination = returnPath(params.get("callbackUrl"));
  const next = destination === "/" ? "" : "?callbackUrl=" + encodeURIComponent(destination);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    setError("");
    if (signup && password !== confirmPassword) { setError("The passwords don’t match. Enter them again."); return; }
    setPending(true);
    try {
      if (signup) {
        const result = await signUpUser({ name: String(data.get("name")).trim(), email, password, confirmPassword });
        if (!result.success) { setError(result.error || "Couldn’t register. Please try again."); setPending(false); return; }
        router.replace("/login?registered=1&callbackUrl=" + encodeURIComponent(destination));
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (!result || result.error) { setError("Check your email and password and try again."); setPending(false); return; }
        router.replace(destination);
        router.refresh();
      }
    } catch { setError("Couldn’t connect. Please try again."); setPending(false); }
  }

  return <section className="account-paper"><div className="account-sheet">
    <h1>{signup ? "Create an account." : "Welcome back."}</h1>
    <p className="account-intro">{signup ? "Save your delivery details and keep your orders in one place." : "Sign in to track your orders and manage your account."}</p>
    <form onSubmit={submit} aria-busy={pending}>
      {signup && <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={50} /></label>}
      <label>Email address<input name="email" type="email" autoComplete="email" autoCapitalize="none" required /></label>
      <div><label htmlFor="account-password">Password</label><div className="account-password">
        <input id="account-password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : undefined} maxLength={signup ? 100 : undefined} aria-describedby={signup ? "password-hint" : undefined}/>
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></div>
        {signup && <small id="password-hint">Use at least 8 characters.</small>}
      </div>
      {signup && <label>Confirm password<input type={visible ? "text" : "password"} name="confirmPassword" autoComplete="new-password" required /></label>}
      {error && <p role="alert" className="account-alert">{error}</p>}
      {!signup && !error && params.get("registered") === "1" && <p role="status" className="account-notice">Registration complete. You can now sign in.</p>}
      <button type="submit" className="account-submit" disabled={pending}>{pending ? (signup ? "Creating account…" : "Signing in…") : (signup ? "Create account" : "Sign in")}<ArrowRight size={17} /></button>
    </form>
    <p className="account-switch">{signup ? "Already have an account?" : "New to RORE CLUB?"} <Link href={(signup ? "/login" : "/signup") + next}>{signup ? "Sign in" : "Create an account"}</Link></p>
  </div></section>;
}
