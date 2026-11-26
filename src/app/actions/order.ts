"use server";

import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/config/shipping";
import { paymentGateway } from "@/lib/payments/razorpay";
import { confirmCapturedPayment } from "@/lib/payments/confirm-order";
import { getQikinkConfig } from "@/lib/qikink/client";
import { parseQikinkAddress } from "@/lib/qikink/fulfillment";
import { getCartItemLimit, getVariants } from "@/lib/validations/variants";

export async function createPendingOrder(addressId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Please sign in to proceed with checkout." };
    const userId = session.user.id;
    const qikink = getQikinkConfig();
    const keyId = paymentGateway.getKeyId();
    if (!qikink || !keyId || (qikink.environment === "live") !== keyId.startsWith("rzp_live_")) {
      return { success: false, error: "Checkout is currently unavailable." };
    }

    const [address, cartItems] = await Promise.all([
      prisma.address.findFirst({ where: { id: addressId, userId } }),
      prisma.cartItem.findMany({ where: { userId }, include: { product: true } }),
    ]);
    if (!address) return { success: false, error: "Select a delivery address." };
    if (!cartItems.length) return { success: false, error: "Your bag is empty." };

    const shipping = parseQikinkAddress({
      ...address,
      email: session.user.email,
      country: address.country.trim().toUpperCase(),
      phone: address.phone?.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, ""),
    });
    if (!shipping.success) {
      return { success: false, error: "Enter an Indian shipping address with a 6-digit PIN code and a valid Indian mobile number." };
    }

    const orderItems = [];
    for (const { product, quantity, id, variant } of cartItems) {
      const option = getVariants(product.qikinkVariants).find(({ label }) => label === variant);
      if (!product.isActive || !option || quantity < 1 || quantity > getCartItemLimit(product, variant)) {
        return { success: false, error: `Update your bag. “${product.name}” has an option or quantity that’s unavailable.` };
      }
      if (option.environment && option.environment !== qikink.environment) {
        return { success: false, error: `“${product.name}” belongs to the ${option.environment} catalog. Checkout is running in ${qikink.environment} mode.` };
      }
      orderItems.push({ productId: product.id, cartItemId: id, variant, quantity, priceAtPurchase: product.price, qikinkSku: option.sku });
    }
    const subtotal = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    const total = subtotal + calculateShippingFee(subtotal);
    const order = await prisma.order.create({
      data: {
        userId, total, shippingAddress: JSON.stringify(shipping.data),
        qikinkEnvironment: qikink.environment, qikinkNumber: `r${randomBytes(7).toString("hex")}`,
        orderItems: { create: orderItems },
      },
    });

    const gatewayOrder = await paymentGateway.createOrder({
      amount: total, currency: "INR", receipt: order.id, notes: { orderId: order.id },
    });
    await prisma.order.update({
      where: { id: order.id }, data: { razorpayOrderId: gatewayOrder.orderId },
    });

    return {
      success: true, orderId: order.id, razorpayOrderId: gatewayOrder.orderId,
      amount: gatewayOrder.amount, currency: gatewayOrder.currency, keyId,
      userEmail: shipping.data.email, userName: shipping.data.fullName, userPhone: shipping.data.phone,
    };
  } catch {
    return { success: false, error: "Could not start checkout. Please try again." };
  }
}

export async function verifyAndConfirmPayment(params: {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const order = await prisma.order.findFirst({
      where: { id: params.orderId, userId: session.user.id },
      select: { id: true, razorpayOrderId: true, paymentId: true },
    });
    if (!order?.razorpayOrderId || order.razorpayOrderId !== params.razorpayOrderId ||
      !paymentGateway.verifyPaymentSignature({
        orderId: order.razorpayOrderId,
        paymentId: params.razorpayPaymentId,
        signature: params.razorpaySignature,
      })) {
      return { success: false, error: "Payment verification failed." };
    }
    if (order.paymentId === params.razorpayPaymentId) return { success: true, orderId: order.id };

    const payment = await paymentGateway.fetchPayment(params.razorpayPaymentId);
    if (payment.id !== params.razorpayPaymentId || payment.order_id !== order.razorpayOrderId) {
      return { success: false, error: "Payment verification failed." };
    }

    const confirmed = await confirmCapturedPayment(order.id, { ...payment, order_id: order.razorpayOrderId });
    return confirmed
      ? { success: true, orderId: order.id }
      : { success: true, pending: true, orderId: order.id };
  } catch {
    return { success: false, error: "Payment verification is delayed. Check your order history before paying again." };
  }
}
