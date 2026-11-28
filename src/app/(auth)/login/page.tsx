import { Suspense } from "react";
import { AccountForm } from "@/components/auth/AccountForm";

export const metadata = {
  title: "Sign in | RORE CLUB",
  description: "Sign in to RORE CLUB to manage your account, delivery addresses, and orders.",
};

export default function Page() {
  return <Suspense fallback={<div className="account-paper" role="status">Loading account form…</div>}><AccountForm /></Suspense>;
}
