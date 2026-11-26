import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface OrderItemInfo {
  name: string;
  quantity: number;
  priceAtPurchase: number;
}

interface AddressInfo {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
}

interface OrderConfirmationPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemInfo[];
  total: number;
  shippingAddress: AddressInfo | string;
}

interface OrderShippedPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: AddressInfo | string;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_placeholder") || apiKey.includes("placeholder")) {
    return null;
  }
  return new Resend(apiKey);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function parseAddress(addr: AddressInfo | string): string {
  if (typeof addr === "string") {
    try {
      const parsed = JSON.parse(addr);
      return `${parsed.fullName || ""}, ${parsed.street || ""}, ${parsed.city || ""}, ${parsed.state || ""} ${parsed.postalCode || ""}, ${parsed.country || "IN"}`;
    } catch {
      return addr;
    }
  }
  return `${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
}

/**
 * Sends order confirmation email to the customer.
 * Fails safely without throwing.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload) {
  const { orderId, customerName, customerEmail, items, total, shippingAddress } = payload;
  const fromEmail = process.env.EMAIL_FROM || "RORE CLUB <orders@roreclub.com>";
  const formattedAddress = escapeHtml(parseAddress(shippingAddress));

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 14px;">
          <strong>${escapeHtml(item.name)}</strong> × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #f4f4f5; text-align: right; font-family: monospace; font-size: 14px;">
          ${formatPrice(item.priceAtPurchase * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmed // RORE CLUB</title>
    </head>
    <body style="margin: 0; padding: 40px 20px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 32px;">
        <div style="text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px 0; font-weight: 900;">RORE CLUB</h1>
          <p style="color: #f43f5e; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; margin: 0;">ORDER CONFIRMED // RECEIPT</p>
        </div>

        <p style="font-size: 15px; line-height: 1.5; color: #d4d4d8;">Hey ${escapeHtml(customerName || "there")},</p>
        <p style="font-size: 15px; line-height: 1.5; color: #a1a1aa;">
          Your order has been paid and confirmed! We are packaging your streetwear pieces and will notify you as soon as your shipment is dispatched.
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <span style="font-size: 11px; text-transform: uppercase; color: #71717a; font-family: monospace; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">ORDER REFERENCE</span>
          <span style="font-size: 14px; font-family: monospace; font-weight: bold; color: #ffffff;">#${escapeHtml(orderId)}</span>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #ffffff; margin-bottom: 12px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px 0 0 0; color: #ffffff; font-weight: bold; font-size: 16px;">Total Paid</td>
            <td style="padding: 16px 0 0 0; color: #ffffff; font-weight: bold; font-family: monospace; font-size: 16px; text-align: right;">${formatPrice(total)}</td>
          </tr>
        </table>

        <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 20px;">
          <h4 style="font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.1em; margin: 0 0 6px 0;">Shipping Address</h4>
          <p style="font-size: 13px; color: #d4d4d8; line-height: 1.5; margin: 0;">${formattedAddress}</p>
        </div>

        <div style="border-top: 1px solid #27272a; padding-top: 24px; margin-top: 32px; text-align: center; color: #71717a; font-size: 12px;">
          <p style="margin: 0;">RORE CLUB Streetwear &bull; Anime Oversized &bull; Accessories</p>
          <p style="margin: 6px 0 0 0;">If you have any questions, reply to this email or visit roreclub.com.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  const resend = getResendClient();

  if (!resend) {
    return { success: false };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Order Confirmed: #${orderId.slice(-8).toUpperCase()} - RORE CLUB`,
      html: emailHtml,
    }, { idempotencyKey: `order-confirmed/${orderId}` });
    return { success: !data.error };
  } catch (error) {
    console.error("Failed to send order confirmation email via Resend:", error);
    return { success: false, error };
  }
}

/**
 * Sends order shipped notification email to the customer.
 * Fails safely without throwing.
 */
export async function sendOrderShippedEmail(payload: OrderShippedPayload) {
  const { orderId, customerName, customerEmail, shippingAddress } = payload;
  const fromEmail = process.env.EMAIL_FROM || "RORE CLUB <orders@roreclub.com>";
  const formattedAddress = escapeHtml(parseAddress(shippingAddress));

  const emailHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Your Drop Is On The Way // RORE CLUB</title>
    </head>
    <body style="margin: 0; padding: 40px 20px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 32px;">
        <div style="text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px 0; font-weight: 900;">RORE CLUB</h1>
          <p style="color: #10b981; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; margin: 0;">ORDER DISPATCHED // ON THE MOVE</p>
        </div>

        <p style="font-size: 15px; line-height: 1.5; color: #d4d4d8;">Hey ${escapeHtml(customerName || "there")},</p>
        <p style="font-size: 15px; line-height: 1.5; color: #a1a1aa;">
          Great news! Your package for order <strong style="color: #ffffff; font-family: monospace;">#${escapeHtml(orderId)}</strong> has shipped and is currently in transit to you.
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <span style="font-size: 24px; display: block; margin-bottom: 8px;">📦 🚚</span>
          <p style="font-size: 14px; font-weight: bold; color: #ffffff; margin: 0 0 4px 0;">Package Dispatched</p>
          <p style="font-size: 12px; color: #a1a1aa; margin: 0;">Delivery usually takes 3-5 business days across India.</p>
        </div>

        <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 20px;">
          <h4 style="font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.1em; margin: 0 0 6px 0;">Destination Address</h4>
          <p style="font-size: 13px; color: #d4d4d8; line-height: 1.5; margin: 0;">${formattedAddress}</p>
        </div>

        <div style="border-top: 1px solid #27272a; padding-top: 24px; margin-top: 32px; text-align: center; color: #71717a; font-size: 12px;">
          <p style="margin: 0;">RORE CLUB Streetwear &bull; Anime Oversized &bull; Accessories</p>
          <p style="margin: 6px 0 0 0;">Questions about tracking? Reach out to us at orders@roreclub.com.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  const resend = getResendClient();

  if (!resend) {
    return { success: false };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Your RORE CLUB order has shipped: #${orderId.slice(-8).toUpperCase()}`,
      html: emailHtml,
    }, { idempotencyKey: `order-shipped/${orderId}` });
    return { success: !data.error };
  } catch (error) {
    console.error("Failed to send order shipped email via Resend:", error);
    return { success: false, error };
  }
}

/**
 * Dispatches order confirmation email idempotently based on orderId.
 * Safe to call multiple times; skips if confirmationEmailSent is already true.
 */
export async function sendOrderConfirmationForOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order || order.confirmationEmailSent || !order.user?.email) {
      return;
    }

    const items = order.orderItems.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
    }));

    const result = await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: order.user.name || "Customer",
      customerEmail: order.user.email,
      items,
      total: order.total,
      shippingAddress: order.shippingAddress,
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { confirmationEmailSent: true },
      });
    }
  } catch (error) {
    console.error("sendOrderConfirmationForOrder error:", error);
  }
}

/**
 * Dispatches order shipped email idempotently based on orderId.
 * Safe to call multiple times; skips if shippedEmailSent is already true.
 */
export async function sendOrderShippedForOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!order || order.shippedEmailSent || !order.user?.email) {
      return;
    }

    const result = await sendOrderShippedEmail({
      orderId: order.id,
      customerName: order.user.name || "Customer",
      customerEmail: order.user.email,
      shippingAddress: order.shippingAddress,
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { shippedEmailSent: true },
      });
    }
  } catch (error) {
    console.error("sendOrderShippedForOrder error:", error);
  }
}

