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
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentNotice && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800 text-xs text-amber-300 flex items-start gap-3">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{paymentNotice}</span>
            </div>
          )}

          {/* Step 1: Delivery Address */}
          <section className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-background font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Select Delivery Address
                </h2>
              </div>
            </div>

            {addressList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center">
                <p className="text-xs text-zinc-400">No saved address found.</p>
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
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "bg-zinc-950 border-accent"
                          : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-accent focus:ring-0"
                        />
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-zinc-100">{addr.fullName}</p>
                          <p className="text-zinc-400">{addr.street}</p>
                          <p className="text-zinc-400">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          {addr.phone && (
                            <p className="text-zinc-500 font-mono">Ph: {addr.phone}</p>
                          )}
                        </div>
                      </div>

                      {addr.isDefault && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
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
          <section className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-background font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Payment Method
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-accent">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">
                    Razorpay Checkout{testMode && " (Test Mode)"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Supports UPI, Credit/Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase font-bold">
                TEST
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Order Review & Pay Action */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Order Review ({items.length} {items.length === 1 ? "Drop" : "Drops"})
            </h3>
            <Link
              href="/cart"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
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
                  <div className="relative w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0] || "/images/products/vintage-boxy-tee.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-200 truncate">{item.product.name}</p>
                    {item.variant && <p className="text-zinc-400">{item.variant}</p>}
                    <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-zinc-200 shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 text-xs border-t border-zinc-800/80 pt-4">
            <div className="flex justify-between text-zinc-400">
              <span>Items Subtotal</span>
              <span className="font-mono font-bold text-zinc-200">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Shipping Fee</span>
              <span className="font-mono text-zinc-200 font-bold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-400 uppercase text-[11px]">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Estimated Taxes</span>
              <span className="font-mono text-zinc-400">Included</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800/80">
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Grand Total
            </span>
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formatPrice(total)}
            </span>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessing || !selectedAddressId || items.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-[0.99]"
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
          <div className="space-y-2 pt-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{testMode ? "Test payment · No money will be charged" : "Payments secured by Razorpay"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent" />
              <span>Ships within 24-48 business hours via insured courier</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
