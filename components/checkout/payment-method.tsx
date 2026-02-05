"use client";

import { useCheckoutStore } from "@/stores/checkout-store";
import type { PaymentMethod as PaymentMethodType } from "@/types/checkout";

interface PaymentMethodProps {
  onBack: () => void;
  onPlaceOrder: () => void;
  loading?: boolean;
}

export function PaymentMethod({ onBack, onPlaceOrder, loading }: PaymentMethodProps) {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  const options: { value: PaymentMethodType; label: string; description: string }[] = [
    {
      value: "CASH_ON_DELIVERY",
      label: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
    {
      value: "MPESA",
      label: "M-Pesa",
      description: "Pay via M-Pesa STK Push",
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
          disabled={loading}
          className="flex-1 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
