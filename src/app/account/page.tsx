import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getUserAddresses } from "@/app/actions/address";
import { AddressManagement } from "@/components/account/AddressManagement";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package, ShieldCheck } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const user = session.user;
  const addresses = await getUserAddresses();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Breadcrumb back */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
          MEMBER PROFILE // OVERVIEW
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          My Account
        </h1>
        <div className="flex items-center gap-3 pt-2">
          {user.role === "ADMIN" && <Link href="/admin" className="drop-button drop-button-outline">Admin</Link>}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="drop-button drop-button-outline" type="submit">Sign out</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.name || "Member"}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
              </div>
            </div>

            <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
              {user.role}
            </Badge>
          </div>

          <div className="border-t border-zinc-800/80 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 font-mono uppercase block text-[10px]">
                Membership ID
              </span>
              <span className="font-mono text-zinc-200 font-bold">
                {user.id ? user.id.slice(-10).toUpperCase() : "ACTIVE"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 font-mono uppercase block text-[10px]">
                Account Status
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Link Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-500" />
              Order History
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track your drops, review receipts, and monitor active package fulfillment.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60">
            <Link
              href="/account/orders"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Address Management Section */}
      <div className="pt-6 border-t border-zinc-900">
        <AddressManagement initialAddresses={addresses} />
      </div>
    </div>
  );
}
