"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusControl({ orderId, currentStatus }: OrderStatusControlProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const handleTransition = (next: OrderStatus) => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next);
      if (!res.success) {
        setError(res.error || "Failed to update order status.");
      } else {
        setStatus(next);
        setMessage(res.message || `Status updated to ${next}`);
        setShowCancelPrompt(false);
      }
    });
  };

  return (
    <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Order Lifecycle & Actions
        </h3>
        <span className="text-[11px] font-mono text-slate-600">
          Current State: <strong className="text-slate-900">{status}</strong>
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Allowed Actions based on current status */}
      <div className="flex flex-wrap items-center gap-3">
        {status === OrderStatus.PAID && (
          <>
            <button
              onClick={() => handleTransition(OrderStatus.SHIPPED)}
              disabled={isPending}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-slate-50 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Truck className="w-3.5 h-3.5" />
              )}
              <span>Mark as Shipped</span>
            </button>

            {!showCancelPrompt ? (
              <button
                onClick={() => setShowCancelPrompt(true)}
                disabled={isPending}
                className="px-4 py-2 rounded-md bg-[#fff] hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-md bg-[#fff] border border-red-200">
                <span className="text-[11px] text-slate-700">Restore stock & cancel?</span>
                <button
                  onClick={() => handleTransition(OrderStatus.CANCELLED)}
                  disabled={isPending}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-800 text-slate-50 text-[11px] font-bold uppercase transition-colors"
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Cancel"}
                </button>
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  disabled={isPending}
                  className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
              </div>
            )}
          </>
        )}

        {status === OrderStatus.SHIPPED && (
          <button
            onClick={() => handleTransition(OrderStatus.DELIVERED)}
            disabled={isPending}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Mark as Delivered</span>
          </button>
        )}

        {status === OrderStatus.PENDING && (
          <button
            onClick={() => handleTransition(OrderStatus.CANCELLED)}
            disabled={isPending}
            className="px-4 py-2 rounded-md bg-[#fff] hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>Cancel Unpaid Order</span>
          </button>
        )}

        {status === OrderStatus.DELIVERED && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Order delivered. Lifecycle complete.</span>
          </div>
        )}

        {status === OrderStatus.CANCELLED && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-red-800 font-mono">
              <XCircle className="w-4 h-4" />
              <span>Order cancelled.</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
              <Info className="w-3.5 h-3.5 text-amber-800" />
              <span>Payment refunds must be processed manually in your Razorpay Dashboard.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
