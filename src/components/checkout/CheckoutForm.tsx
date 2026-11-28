"use client";

import { useState } from "react";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { createPendingOrder, verifyAndConfirmPayment } from "@/app/actions/order";
import { AddressManagement, SerializedAddress } from "@/components/account/AddressManagement";
import { ArrowLeft, Lock, ShieldAlert, ShieldCheck, Sparkles, Truck } from "lucide-react";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface CheckoutItem {
  id: string;
  productId: string;
  quantity: number;
  variant: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
  };
}

interface CheckoutFormProps {
  testMode: boolean;
  addresses: SerializedAddress[];
  items: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export function CheckoutForm({
  testMode,
  addresses,
  items,
  subtotal,
  shippingFee,
  total,
}: CheckoutFormProps) {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [addressList, setAddressList] = useState<SerializedAddress[]>(addresses);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const handlePayNow = async () => {
    if (!window.Razorpay) {
      setErrorMessage("Razorpay checkout is still loading. Try again in a moment.");
      return;
    }
    if (!selectedAddressId) {
      setErrorMessage("Please select or add a delivery address.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPaymentNotice(null);

    try {
      // 1. Initialize PENDING order on server with live database prices
      const result = await createPendingOrder(selectedAddressId);

      if (!result.success || !result.orderId) {
        setErrorMessage(result.error || "Failed to initialize order.");
        setIsProcessing(false);
        return;
      }

      const options: RazorpayOptions = {
        key: result.keyId,
        amount: result.amount || total,
        currency: result.currency || "INR",
        name: "RORE CLUB",
        description: `Streetwear Drop Order #${result.orderId.slice(-8).toUpperCase()}`,
        order_id: result.razorpayOrderId || "",
        prefill: {
          name: result.userName,
          email: result.userEmail,
          contact: result.userPhone,
        },
        theme: {
          color: "#790b13",
        },
        handler: async (response: RazorpayResponse) => {
          setIsProcessing(true);
          try {
            const confirmRes = await verifyAndConfirmPayment({
              orderId: result.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (confirmRes.success) {
              if (!confirmRes.pending) await refreshCart();
              router.push(`/orders/${result.orderId}${confirmRes.pending ? "" : "?payment=success"}`);
            } else {
              setErrorMessage(confirmRes.error || "Payment signature verification failed.");
              setIsProcessing(false);
            }
          } catch {
            setErrorMessage("An error occurred during verification.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentNotice("Payment window closed. Your bag is preserved and you can retry anytime.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setErrorMessage("Unable to start payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Razorpay Standard Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Delivery Address Selection & Summary */}
        <div className="lg:col-span-7 space-y-8">
          {/* Status Notices */}
          {errorMessage && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-shop-wine flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0 text-shop-wine mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentNotice && (
            <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-900 mt-0.5" />
              <span>{paymentNotice}</span>
            </div>
          )}

          {/* Step 1: Delivery Address */}
          <section className="p-6 rounded-lg bg-shop-card border border-shop-rule space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-shop-wine text-shop-ivory font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-shop-ink uppercase tracking-wider">
                  Select Delivery Address
                </h2>
              </div>
            </div>

            {addressList.length === 0 ? (
              <div className="p-4 rounded-md bg-shop-soft border border-dashed border-shop-rule text-center">
                <p className="text-xs text-shop-muted">No saved address found.</p>
                <div className="mt-3">
                  <AddressManagement
                    initialAddresses={[]}
                    onAddressCreated={(newAddr) => {
                      setAddressList([newAddr]);
                      setSelectedAddressId(newAddr.id);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {addressList.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-md border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "bg-shop-soft border-shop-wine"
                          : "bg-shop-soft border-shop-rule hover:border-shop-rule"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress" aria-label={`Deliver to ${addr.fullName}, ${addr.street}`}
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-shop-wine focus:ring-0"
                        />
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-shop-ink">{addr.fullName}</p>
                          <p className="text-shop-muted">{addr.street}</p>
                          <p className="text-shop-muted">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          {addr.phone && (
                            <p className="text-shop-muted"><a className="contact-link" href={`tel:${addr.phone.replace(/[^+0-9]/g, "")}`}>{addr.phone}</a></p>
                          )}
                        </div>
                      </div>

                      {addr.isDefault && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-shop-card border border-shop-rule text-shop-muted">
                          Default
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2">
                  <AddressManagement
                    initialAddresses={addressList}
                    onAddressCreated={(newAddr) => {
                      setAddressList((prev) => [...prev, newAddr]);
                      setSelectedAddressId(newAddr.id);
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Step 2: Payment Gateway Method */}
          <section className="p-6 rounded-lg bg-shop-card border border-shop-rule space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-shop-wine text-shop-ivory font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-shop-ink uppercase tracking-wider">
                Payment Method
              </h2>
            </div>

            <div className="p-4 rounded-md bg-shop-soft border border-shop-rule flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-shop-card flex items-center justify-center text-shop-wine">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-shop-ink">
                    Razorpay Checkout{testMode && " (Test Mode)"}
                  </p>
                  <p className="text-[11px] text-shop-muted">
                    Supports UPI, Credit/Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase font-bold">
                TEST
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Order Review & Pay Action */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-lg bg-shop-card border border-shop-rule space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-shop-rule pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-shop-ink">
              Order Review ({items.length} {items.length === 1 ? "Drop" : "Drops"})
            </h3>
            <Link
              href="/cart"
              className="text-xs text-shop-muted hover:text-shop-ink flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Bag
            </Link>
          </div>

          {/* Items Summary list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-shop-soft border border-shop-rule overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0] || "/images/products/vintage-boxy-tee.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-shop-ink truncate">{item.product.name}</p>
                    {item.variant && <p className="text-shop-muted">{item.variant}</p>}
                    <p className="text-[11px] text-shop-muted">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-shop-ink shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 text-xs border-t border-shop-rule pt-4">
            <div className="flex justify-between text-shop-muted">
              <span>Items Subtotal</span>
              <span className="font-bold text-shop-ink">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-shop-muted">
              <span>Shipping Fee</span>
              <span className="text-shop-ink font-bold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-800 uppercase text-[11px]">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div className="flex justify-between text-shop-muted">
              <span>Estimated Taxes</span>
              <span className="text-shop-muted">Included</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-shop-rule">
            <span className="text-sm font-bold uppercase tracking-wider text-shop-ink">
              Grand Total
            </span>
            <span className="text-2xl font-black text-shop-ink tracking-tight">
              {formatPrice(total)}
            </span>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessing || !selectedAddressId || items.length === 0}
            className="w-full py-4 px-6 rounded-md bg-shop-wine hover:bg-[#41151b] text-shop-ivory font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-[0.99]"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay {formatPrice(total)} Now</span>
              </>
            )}
          </button>

          {/* Security Badges */}
          <div className="space-y-2 pt-2 text-[11px] text-shop-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>{testMode ? "Test payment · No money will be charged" : "Payments secured by Razorpay"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-shop-wine" />
              <span>Ships within 24-48 business hours via insured courier</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
