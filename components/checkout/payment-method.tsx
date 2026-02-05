"use client";

import { useCheckoutStore } from "@/stores/checkout-store";
import type { PaymentMethod as PaymentMethodType } from "@/types/checkout";

interface PaymentMethodProps {
  onBack: () => void;
  onPlaceOrder: () => void;
  loading?: boolean;
  /** Required when payment is Paystack and user is not logged in */
  paystackEmail?: string;
  onPaystackEmailChange?: (email: string) => void;
  hasSessionEmail?: boolean;
}

export function PaymentMethod({
  onBack,
  onPlaceOrder,
  loading,
  paystackEmail = "",
  onPaystackEmailChange,
  hasSessionEmail = false,
}: PaymentMethodProps) {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  const options: { value: PaymentMethodType; label: string; description: string }[] = [
    {
      value: "CASH_ON_DELIVERY",
      label: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
    {
      value: "PAYSTACK",
      label: "Paystack",
      description: "Pay with card, mobile money, or bank",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              paymentMethod === opt.value
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/30"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={opt.value}
              checked={paymentMethod === opt.value}
              onChange={() => setPaymentMethod(opt.value)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-foreground">{opt.label}</p>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      {paymentMethod === "PAYSTACK" && !hasSessionEmail && (
        <div className="space-y-2">
          <label htmlFor="paystack-email" className="block text-sm font-medium text-foreground">
            Email for payment receipt
          </label>
          <input
            id="paystack-email"
            type="email"
            value={paystackEmail}
            onChange={(e) => onPaystackEmailChange?.(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md border border-border px-4 py-3 font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
disabled={
          loading ||
          (paymentMethod === "PAYSTACK" && !hasSessionEmail && !paystackEmail?.trim())
        }
        className="flex-1 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (paymentMethod === "PAYSTACK" ? "Redirecting to payment..." : "Placing order...") : "Place Order"}
        </button>
      </div>
    </div>
  );
}
