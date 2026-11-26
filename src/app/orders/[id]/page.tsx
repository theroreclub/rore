import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: OrderPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { payment } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  // Strict ownership check: User may only view their own order
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  // Parse snapshot shipping address
  let shippingAddress: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } = {};

  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch {
    shippingAddress = { street: order.shippingAddress };
  }

  const isPaid = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);
  const itemsSubtotal = order.orderItems.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );
  const shippingFee = Math.max(0, order.total - itemsSubtotal);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          View All Orders
        </Link>
      </div>

      {/* Confirmation Banner */}
      {payment === "success" && isPaid && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-900/60 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-emerald-300 uppercase tracking-wide">
              Payment Successful // Drop Confirmed
            </h2>
            <p className="text-xs text-emerald-400/90 leading-relaxed">
              Your payment has been verified. You can follow your order here as it moves into fulfillment.
            </p>
          </div>
        </div>
      )}
      {order.status === "PENDING" && (
        <p role="status" className="rounded-2xl border p-4 text-sm text-zinc-300">
          Awaiting payment confirmation. Refresh this page to check for updates before paying again.
        </p>
      )}
      {order.trackingUrl && (
        <a className="drop-button drop-button-outline" href={order.trackingUrl} target="_blank" rel="noreferrer">
          Track your package
        </a>
      )}

      {/* Order Header Meta */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
              OFFICIAL RECEIPT // ID: #{order.id.slice(-8).toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Order Details
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                isPaid
                  ? "success"
                  : order.status === "PENDING"
                  ? "warning"
                  : "destructive"
              }
              className="text-xs px-3 py-1"
            >
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Transaction & Delivery Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Payment Info */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <span className="text-zinc-500 font-mono uppercase block text-[10px]">
              Payment Verification
            </span>
            <div className="space-y-1">
              <p className="font-bold text-zinc-200">
                Gateway: <span className="text-rose-400">Razorpay Secure</span>
              </p>
              {order.paymentId && (
                <p className="text-zinc-400 font-mono">
                  Ref ID: <span className="text-zinc-300">{order.paymentId}</span>
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="text-zinc-500 font-mono text-[11px]">
                  Order Ref: {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <span className="text-zinc-500 font-mono uppercase block text-[10px] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Delivery Destination
            </span>
            <div className="text-zinc-300 space-y-0.5">
              <p className="font-bold text-white">{shippingAddress.fullName || session.user.name}</p>
              <p>{shippingAddress.street}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && (
                <p className="text-zinc-500 font-mono mt-1">Ph: {shippingAddress.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Drops List */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
            RESERVED MERCHANDISE ({order.orderItems.length})
          </h3>

          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0] || "/images/products/vintage-boxy-tee.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-bold text-sm text-zinc-100 hover:text-rose-400 transition-colors truncate block"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && <p className="text-xs text-zinc-400">{item.variant}</p>}
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {item.quantity} × {formatPrice(item.priceAtPurchase)}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-white shrink-0">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="font-mono text-zinc-200">{formatPrice(itemsSubtotal)}</span>
          </div>

          <div className="flex justify-between text-zinc-400">
            <span>Shipping Fee</span>
            <span className="font-mono text-zinc-200">
              {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-400">
            <span>Taxes & Duties</span>
            <span className="font-mono text-zinc-400">Included</span>
          </div>

          <div className="flex justify-between items-baseline pt-3 border-t border-zinc-800">
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Total Amount
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
