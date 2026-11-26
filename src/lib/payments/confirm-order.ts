import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationForOrder } from "@/lib/email";
import { submitQikinkOrder } from "@/lib/qikink/fulfillment";

export async function confirmCapturedPayment(orderId: string, payment: {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
}) {
  if (payment.status !== "captured" || payment.currency !== "INR") return false;

  const confirmed = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
    if (!order || payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== order.total) return false;

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING", paymentId: null },
      data: {
        status: "PAID",
        paymentId: payment.id,
        ...(order.qikinkNumber ? { fulfillmentStatus: "QUEUED" } : {}),
      },
    });

    if (!updated.count) {
      const existing = await tx.order.findUnique({ where: { id: orderId }, select: { paymentId: true } });
      return existing?.paymentId === payment.id;
    }

    for (const item of [...order.orderItems].sort((a, b) => a.productId.localeCompare(b.productId))) {
      if (!order.qikinkNumber) {
        const stock = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (!stock.count) throw new Error("A previously ordered item is out of stock.");
      }

      const where = item.cartItemId
        ? { id: item.cartItemId, userId: order.userId }
        : { userId: order.userId, productId: item.productId, variant: item.variant };
      const adjusted = await tx.cartItem.updateMany({
        where: { ...where, quantity: { gt: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (!adjusted.count) {
        await tx.cartItem.deleteMany({ where: { ...where, quantity: { lte: item.quantity } } });
      }
    }
    return true;
  });

  if (confirmed) {
    after(async () => {
      const results = await Promise.allSettled([
        submitQikinkOrder(orderId),
        sendOrderConfirmationForOrder(orderId),
      ]);
      for (const result of results) {
        if (result.status === "rejected") console.error("Order post-payment task failed", orderId);
      }
    });
  }
  return confirmed;
}
