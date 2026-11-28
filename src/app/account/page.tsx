import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getUserAddresses } from "@/app/actions/address";
import { AddressManagement } from "@/components/account/AddressManagement";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

export const metadata = {
  title: "My account | RORE CLUB",
  description: "Manage your RORE CLUB profile, delivery addresses, and order history.",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const user = session.user;
  const addresses = await getUserAddresses();

  return (
    <div className="shop-page member-page store-shell">
      <Link href="/" className="member-back"><ArrowLeft size={15} /> Back to store</Link>
      <header className="member-heading">
        <h1>My account</h1>
        <div className="member-tools">
          {user.role === "ADMIN" && <Link href="/admin">Admin portal <ArrowRight size={14} /></Link>}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <div className="member-grid">
        <section className="member-profile">
          <div className="member-identity">
            <span aria-hidden="true" className="member-initial">{(user.name || "Member").slice(0, 1).toUpperCase()}</span>
            <div><h2>{user.name || "Member"}</h2>
              {user.email && <a className="contact-link" href={`mailto:${user.email}`}>{user.email}</a>}
            </div>
          </div>
          <dl className="member-facts">
            <div><dt>Membership</dt><dd>{user.role === "ADMIN" ? "Administrator" : "Customer"}</dd></div>
            {user.id && <div><dt>Membership ID</dt><dd>{user.id.slice(-10).toUpperCase()}</dd></div>}
            <div><dt>Status</dt><dd className="member-active">Active</dd></div>
          </dl>
        </section>
        <section className="member-orders">
          <Package size={25} strokeWidth={1.4} aria-hidden="true" />
          <h2>Order history</h2>
          <p>Track deliveries and find your receipts.</p>
          <Link href="/account/orders" className="member-order-link">View all orders <ArrowRight size={16} /></Link>
        </section>
      </div>
      <section className="member-addresses" aria-label="Delivery addresses">
        <AddressManagement initialAddresses={addresses} />
      </section>
    </div>
  );
}
