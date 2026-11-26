import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy | RORE CLUB",
  description: "How RORE CLUB handles your account, payment and delivery information.",
};

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <article aria-labelledby="privacy-title">
        <h1 id="privacy-title">Privacy policy</h1>
        <p>RORE CLUB uses the details you share with us to run your account, take payment and get your made-to-order merch to you.</p>

        <h2>Your account and shopping bag</h2>
        <p>When you register, we store your name, email address and a protected hash of your password. We use cookies to keep you signed in. While you shop as a guest, your browser stores your bag on your device. Clearing this site’s browser data removes the guest bag. When you sign in, we can save your bag with your account.</p>

        <h2>Payment, printing and delivery</h2>
        <p>Razorpay handles the payment details you enter at checkout. We keep your order total, payment reference and payment status so we can match your payment to your order.</p>
        <p>We share the items you ordered, your name, delivery address and contact details with Qikink so it can print, pack and arrange delivery. We use your email address and order details to send confirmations and tracking updates through Resend.</p>

        <h2>Your order records</h2>
        <p>We keep order and transaction records for order history, delivery queries, payment disputes and accounting. Removing a saved address from your account does not remove the delivery details attached to an order you already placed.</p>

        <h2>Your choices and requests</h2>
        <p>You can manage saved addresses in <Link href="/account">My account</Link> and view purchases in your <Link href="/account/orders">order history</Link>. To ask about information we hold about you, or to request a correction or deletion, email <a href="mailto:orders@roreclub.com">orders@roreclub.com</a> from the address you used to shop. Include your order number if the request concerns a purchase.</p>
      </article>
    </div>
  );
}
