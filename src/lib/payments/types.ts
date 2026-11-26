/**
 * Payment Gateway Abstraction Layer
 * Keeps all gateway-specific logic decoupled so it can be swapped for Stripe
 * without changing order or checkout logic.
 */

export interface CreateGatewayOrderParams {
  amount: number; // in smallest currency unit (paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentGatewayService {
  createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult>;
  verifyPaymentSignature(params: VerifyPaymentParams): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
