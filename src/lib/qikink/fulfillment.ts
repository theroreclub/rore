import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createQikinkOrder, getQikinkConfig, getQikinkShipment, QikinkError } from "./client";

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  street: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().regex(/^[1-9]\d{5}$/),
  country: z.literal("IN"),
  email: z.email(),
});

export function parseQikinkAddress(address: unknown) {
  return addressSchema.safeParse(address);
}

export async function submitQikinkOrder(orderId: string, retry = false) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
  if (!order?.qikinkNumber || order.status !== "PAID" || !order.paymentId || order.qikinkOrderId) return;
  if (order.fulfillmentStatus !== "QUEUED" && !(retry && order.fulfillmentStatus === "FAILED")) return;

  const claim = await prisma.order.updateMany({
    where: { id: orderId, status: "PAID", fulfillmentStatus: order.fulfillmentStatus },
    data: { fulfillmentStatus: "SUBMITTING", fulfillmentAttemptedAt: new Date(), fulfillmentError: null },
  });
  if (!claim.count) return;

  let providerId: string;
  try {
    const config = getQikinkConfig();
    if (!config || config.environment !== order.qikinkEnvironment) {
      throw new QikinkError("Configure the Qikink environment selected when the order was placed.", true);
    }
    const address = addressSchema.safeParse(JSON.parse(order.shippingAddress));
    if (!address.success || !order.orderItems.length || order.orderItems.some((item) => !item.qikinkSku)) {
      throw new QikinkError("The shipping address or purchased SKU snapshot is incomplete.", true);
    }
    const { fullName, street, phone, city, state, postalCode, country, email } = address.data;
    const [firstName, ...rest] = fullName.split(/\s+/);
    const splitAt = street.length <= 80 ? street.length : street.lastIndexOf(" ", 80);
    const boundary = splitAt > 40 ? splitAt : Math.min(street.length, 80);

    providerId = await createQikinkOrder(config, {
      order_number: order.qikinkNumber,
      qikink_shipping: 1,
      gateway: "Prepaid",
      total_order_value: order.orderItems.reduce((sum, item) => sum + item.quantity * item.priceAtPurchase, 0) / 100,
      line_items: order.orderItems.map((item) => ({
        search_from_my_products: 1, sku: item.qikinkSku, quantity: item.quantity, price: item.priceAtPurchase / 100,
      })),
      shipping_address: {
        first_name: firstName, last_name: rest.join(" ") || firstName,
        address1: street.slice(0, boundary), address2: street.slice(boundary).trim(),
        phone, email, city, zip: postalCode, province: state, country_code: country,
      },
    });
  } catch (error) {
    await prisma.order.updateMany({
      where: { id: orderId, fulfillmentStatus: "SUBMITTING" },
      data: {
        fulfillmentStatus: error instanceof QikinkError && error.safeToRetry ? "FAILED" : "REVIEW",
        fulfillmentError: error instanceof QikinkError ? error.message : "Confirm the outcome in Qikink before resubmitting.",
      },
    });
    return;
  }

  await prisma.order.updateMany({
    where: { id: orderId, fulfillmentStatus: "SUBMITTING" },
    data: { fulfillmentStatus: "SUBMITTED", qikinkOrderId: providerId },
  });
}

export async function refreshQikinkOrder(orderId: string, manualId?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const config = getQikinkConfig();
  if (!order?.qikinkNumber || !order.paymentId || !config || config.environment !== order.qikinkEnvironment) {
    throw new Error("The order’s Qikink environment needs to be configured.");
  }

  const providerId = order.qikinkOrderId || manualId;
  const stale = order.fulfillmentStatus === "SUBMITTING" && order.fulfillmentAttemptedAt &&
    Date.now() - order.fulfillmentAttemptedAt.getTime() > 120000;
  if (!providerId || (!order.qikinkOrderId && order.fulfillmentStatus !== "REVIEW" && !stale)) {
    throw new Error("Wait for the initial submission, or enter its existing Qikink order ID when review is needed.");
  }
  const shipment = await getQikinkShipment(config, providerId, order.qikinkNumber);
  const remoteStatus = shipment.status.trim().toLowerCase();
  const nextStatus = remoteStatus === "delivered" && (order.status === "PAID" || order.status === "SHIPPED")
    ? "DELIVERED"
    : /^(shipped|in[ -]transit|out for delivery|dispatched|picked up)$/.test(remoteStatus) && order.status === "PAID" ? "SHIPPED" : undefined;

  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: order.status, fulfillmentStatus: order.fulfillmentStatus },
    data: {
      qikinkOrderId: providerId, qikinkStatus: shipment.status, trackingUrl: shipment.trackingUrl,
      fulfillmentStatus: "SUBMITTED", fulfillmentError: null, status: nextStatus,
    },
  });
  if (!updated.count) throw new Error("The order changed while syncing. Please refresh and try again.");
  return { shipped: nextStatus === "SHIPPED" };
}
