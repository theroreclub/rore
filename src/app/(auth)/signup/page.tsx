import { Suspense } from "react";
import { AccountForm } from "@/components/auth/AccountForm";

export const metadata = {
  title: "Create an account | RORE CLUB",
  description: "Create a RORE CLUB account to save addresses and track your merch orders.",
};

export default function Page() {
  return <Suspense fallback={<div className="account-paper" role="status">Loading account form…</div>}><AccountForm signup /></Suspense>;
}
