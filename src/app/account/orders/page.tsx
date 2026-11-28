import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";

export const metadata = {
  title: "Order history | RORE CLUB",
  description: "View your RORE CLUB purchases and open order details.",
  robots: { index: false },
};

export default async function OrderHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const userId = session.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="shop-page max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-shop-rule">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-shop-ink uppercase tracking-tight mt-1">
            Order history
          </h1>
        </div>

        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-shop-muted hover:text-shop-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Account
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-lg bg-shop-card border border-shop-rule text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-md bg-shop-card border border-shop-rule flex items-center justify-center text-shop-muted mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-shop-ink uppercase tracking-tight">
            No orders yet
          </h2>
          <p className="text-xs text-shop-muted mt-2 leading-relaxed">
            Your receipts and delivery updates will appear here after your first order.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-shop-wine hover:bg-[#41151b] text-shop-ivory text-xs font-black uppercase tracking-wider transition-all"
          >
            <span>Explore Drops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.status === "PAID";
            const itemCount = order.orderItems.reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="p-6 rounded-lg bg-shop-card border border-shop-rule hover:border-shop-rule transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-shop-ink">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <Badge
                      variant={
                        isPaid
                          ? "success"
                          : order.status === "PENDING"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    {order.orderItems.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-12 rounded-lg bg-shop-soft border border-shop-rule overflow-hidden shrink-0"
                        title={item.product.name}
                      >
                        <Image
                          src={item.product.images[0] || "/images/products/vintage-boxy-tee.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-shop-soft border border-shop-rule flex items-center justify-center text-xs text-shop-ink font-bold shrink-0">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-shop-muted">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{itemCount} {itemCount === 1 ? "piece" : "pieces"}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-shop-rule shrink-0">
                  <span className="text-xl font-black text-shop-ink">
                    {formatPrice(order.total)}
                  </span>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-shop-soft hover:bg-shop-rule text-xs font-bold text-shop-ink uppercase tracking-wider transition-colors"
                  >
                    <span>View Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
