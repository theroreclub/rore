import { getRequestSession } from "@/lib/auth-checks";
import { notFound, redirect } from "next/navigation";
import { getAdminOrderById } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { QikinkOrderControl } from "@/components/admin/QikinkOrderControl";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, MapPin, CreditCard, Mail } from "lucide-react";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function parseAddressSafely(addressStr: string) {
  try {
    return JSON.parse(addressStr);
  } catch {
    return null;
  }
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const session = await getRequestSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const parsedAddress = parseAddressSafely(order.shippingAddress);
  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono uppercase tracking-wider transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-mono">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Placed on {formattedDate} &bull; Full ID: {order.id}
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle Actions Bar */}
      {order.qikinkNumber ? (
        <QikinkOrderControl
          orderId={order.id}
          reference={order.qikinkNumber}
          environment={order.qikinkEnvironment}
          providerId={order.qikinkOrderId}
          status={order.qikinkStatus || order.fulfillmentStatus}
          error={order.fulfillmentError}
          canSend={order.fulfillmentStatus === "QUEUED" || order.fulfillmentStatus === "FAILED"}
          needsReview={order.fulfillmentStatus === "REVIEW" || order.fulfillmentStatus === "SUBMITTING"}
        />
      ) : <OrderStatusControl orderId={order.id} currentStatus={order.status} />}

      {/* Main Grid: Details + Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Ordered Items Table (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-zinc-800">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Line Items ({order.orderItems.length})
              </h2>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {order.orderItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                      <Image
                        src={item.product.images[0] || "/images/products/vintage-boxy-tee.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${item.product.id}/edit`}
                        className="font-bold text-white hover:text-rose-400 transition-colors text-sm"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && <p className="text-xs text-zinc-400">{item.variant}</p>}
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">
                        Unit Price: {formatPrice(item.priceAtPurchase)} &times; {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-zinc-950/60 border-t border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Items</span>
                <span>
                  {formatPrice(
                    order.orderItems.reduce((acc, i) => acc + i.priceAtPurchase * i.quantity, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping Calculation</span>
                <span className="text-emerald-400">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Paid</span>
                <span className="text-rose-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Customer & Fulfillment Snapshot (1 col) */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <User className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Customer Profile
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px] font-mono">NAME</span>
                <span className="text-white font-bold">{order.user.name || "Customer"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px] font-mono">EMAIL</span>
                <a
                  href={`mailto:${order.user.email}`}
                  className="text-zinc-300 hover:text-white font-mono flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{order.user.email}</span>
                </a>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px] font-mono">USER ID</span>
                <span className="text-zinc-400 font-mono text-[11px]">{order.userId}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <MapPin className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Shipping Destination
              </h3>
            </div>
            {parsedAddress ? (
              <div className="text-xs space-y-1 text-zinc-300 font-mono leading-relaxed">
                <p className="font-bold text-white">{parsedAddress.fullName}</p>
                <p>{parsedAddress.street}</p>
                <p>
                  {parsedAddress.city}, {parsedAddress.state} {parsedAddress.postalCode}
                </p>
                <p>{parsedAddress.country || "India"}</p>
                {parsedAddress.phone && (
                  <p className="text-zinc-400 pt-1">Phone: {parsedAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-mono whitespace-pre-line">
                {order.shippingAddress}
              </p>
            )}
          </div>

          {/* Payment Snapshot */}
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Payment Info
              </h3>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[11px]">PAYMENT ID</span>
                <span className="text-white font-bold">
                  {order.paymentId || "Pending / None"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">RAZORPAY ORDER ID</span>
                <span className="text-zinc-400 text-[11px]">
                  {order.razorpayOrderId || "N/A"}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Emails Dispatched</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      order.confirmationEmailSent ? "text-emerald-400" : "text-zinc-600"
                    }
                  >
                    Paid: {order.confirmationEmailSent ? "Yes" : "No"}
                  </span>
                  &bull;
                  <span
                    className={
                      order.shippedEmailSent ? "text-emerald-400" : "text-zinc-600"
                    }
                  >
                    Shipped: {order.shippedEmailSent ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
