import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/config/shipping";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCartItemLimit } from "@/lib/validations/variants";
import { getQikinkConfig } from "@/lib/qikink/client";
import { paymentGateway } from "@/lib/payments/razorpay";

export const metadata = {
  title: "Checkout | RORE CLUB",
  description: "Select a delivery address and complete your RORE CLUB order.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const userId = session.user.id;

  // 1. Fetch user cart items directly from database with current product info
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          isActive: true,
          qikinkVariants: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // If bag is empty, redirect back to cart
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // 2. Validate product availability and stock levels on server
  let subtotal = 0;
  for (const item of cartItems) {
    const limit = getCartItemLimit(item.product, item.variant);
    if (!item.product.isActive || !limit || item.quantity > limit) {
      redirect("/cart?error=item_unavailable");
    }
    subtotal += item.product.price * item.quantity;
  }

  const shippingFee = calculateShippingFee(subtotal);
  const total = subtotal + shippingFee;
  const qikink = getQikinkConfig();
  const key = paymentGateway.getKeyId();
  const checkoutReady = !!qikink && !!key && (qikink.environment === "live") === key.startsWith("rzp_live_");

  // 3. Fetch user's saved addresses
  const rawAddresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const serializedAddresses = rawAddresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    street: a.street,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
  }));

  const checkoutItems = cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    variant: item.variant,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      stock: item.product.stock,
      images: item.product.images,
    },
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      {/* Checkout Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-zinc-800/80">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
            SECURE CHECKOUT // STEP 2 OF 2
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            Order Finalization
          </h1>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Bag
        </Link>
      </div>

      {checkoutReady ? <CheckoutForm
        testMode={key.startsWith("rzp_test_")}
        addresses={serializedAddresses}
        items={checkoutItems}
        subtotal={subtotal}
        shippingFee={shippingFee}
        total={total}
      /> : <p role="status" className="border p-4">Checkout is currently unavailable.</p>}
    </div>
  );
}
