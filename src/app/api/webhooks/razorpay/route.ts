import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { paymentGateway } from "@/lib/payments/razorpay";
import { confirmCapturedPayment } from "@/lib/payments/confirm-order";

const capturedEvent = z.object({
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        currency: z.literal("INR"),
        status: z.literal("captured"),
        amount: z.number().int().positive(),
      }),
    }),
  }),
});

export async function POST(request: Request) {
  const raw = await request.text();
  if (!paymentGateway.verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") || "")) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const body = JSON.parse(raw);
    if (body?.event !== "payment.captured" && body?.event !== "order.paid") {
      return Response.json({ received: true });
    }
    const parsed = capturedEvent.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid payment event" }, { status: 400 });
    const payment = parsed.data.payload.payment.entity;
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: payment.order_id }, select: { id: true },
    });
    if (!order) return Response.json({ received: true });

    const confirmed = await confirmCapturedPayment(order.id, payment);
    return Response.json({ received: true, confirmed });
  } catch {
    return Response.json({ error: "Payment notification could not be processed." }, { status: 500 });
  }
}
