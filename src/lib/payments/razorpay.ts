import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { CreateGatewayOrderParams, GatewayOrderResult, VerifyPaymentParams } from "./types";

function compareSignature(secret: string | undefined, data: string, signature: string) {
  if (!secret || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(data).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

class RazorpayService {
  getKeyId() {
    const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    return key && /^rzp_(test|live)_/.test(key) && !/placeholder|yourKey/i.test(key) &&
      process.env.RAZORPAY_KEY_SECRET && !/placeholder|yourRazorpay/i.test(process.env.RAZORPAY_KEY_SECRET) ? key : null;
  }

  private getClient() {
    const key_id = this.getKeyId();
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) throw new Error("Razorpay checkout is not configured.");
    return new Razorpay({ key_id, key_secret });
  }

  async createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    const order = await this.getClient().orders.create(params);
    return { orderId: order.id, amount: Number(order.amount), currency: order.currency };
  }

  async fetchPayment(paymentId: string) {
    return this.getClient().payments.fetch(paymentId);
  }

  verifyPaymentSignature({ orderId, paymentId, signature }: VerifyPaymentParams) {
    return compareSignature(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`, signature);
  }

  verifyWebhookSignature(rawBody: string, signature: string) {
    return compareSignature(process.env.RAZORPAY_WEBHOOK_SECRET, rawBody, signature);
  }
}

export const paymentGateway = new RazorpayService();
