"use client";

import { useEffect } from "react";
import { Banknote, ChevronLeft, Mail, Loader2, Wallet, Smartphone } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import type { PaymentMethod as PaymentMethodType } from "@/types/checkout";

/** M-Pesa style icon: green rounded square with white M */
function MpesaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="8" fill="#00A651" />
      <path
        d="M12 28V12h3.2l4.2 10.2L23.6 12H27v16h-3.2v-9.4l-3.8 9.4h-2.2l-3.8-9.4V28H12z"
        fill="white"
      />
    </svg>
  );
}

const TILL_NUMBER = "3020127";

const paymentIcons = {
  CASH_ON_DELIVERY: Banknote,
  PAYSTACK: MpesaIcon,
  WALLET: Wallet,
  TILL: Smartphone,
} as const;

interface PaymentMethodProps {
  onBack: () => void;
  onPlaceOrder: () => void;
  loading?: boolean;
  /** Required when payment is Paystack and user is not logged in */
  paystackEmail?: string;
  onPaystackEmailChange?: (email: string) => void;
  hasSessionEmail?: boolean;
  /** First-time customers must use M-Pesa (Paystack) or till; cash on delivery only on subsequent orders */
  isFirstOrder?: boolean;
  /** TILL requires login */
  hasSession?: boolean;
  /** Order total in cents (subtotal + delivery). Used to enable/disable Wallet. */
  orderTotalCents?: number;
  /** Current wallet balance in cents. null = not loaded or not logged in. */
  walletBalanceCents?: number | null;
}

export function PaymentMethod({
  onBack,
  onPlaceOrder,
  loading,
  paystackEmail = "",
  onPaystackEmailChange,
  hasSessionEmail = false,
  isFirstOrder = false,
  hasSession = false,
  orderTotalCents = 0,
  walletBalanceCents = null,
}: PaymentMethodProps) {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  useEffect(() => {
    if (isFirstOrder && paymentMethod === "CASH_ON_DELIVERY") {
      setPaymentMethod("PAYSTACK");
    }
  }, [isFirstOrder, paymentMethod, setPaymentMethod]);

  const allOptions: {
    value: PaymentMethodType;
    label: string;
    description: string;
    disabled?: boolean;
    disabledReason?: string;
  }[] = [
    {
      value: "CASH_ON_DELIVERY",
      label: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
    {
      value: "PAYSTACK",
      label: "M-Pesa / Paystack",
      description: "Pay with M-Pesa, card, or bank",
    },
    {
      value: "WALLET",
      label: "Wallet",
      description:
        walletBalanceCents === null
          ? "Loading balance…"
          : `Balance: KES ${((walletBalanceCents ?? 0) / 100).toLocaleString()}`,
      disabled: walletBalanceCents !== null && (walletBalanceCents ?? 0) < orderTotalCents,
      disabledReason:
        walletBalanceCents !== null && (walletBalanceCents ?? 0) < orderTotalCents
          ? "Insufficient balance (top up or use another method)"
          : undefined,
    },
    {
      value: "TILL",
      label: "Pay via Till",
      description: `Send to till ${TILL_NUMBER}. This will be processed manually.`,
    },
  ];

  const options = isFirstOrder
    ? allOptions.filter(
        (o) =>
          o.value === "PAYSTACK" ||
          (o.value === "TILL" && hasSession) ||
          (o.value === "WALLET" && hasSession)
      )
    : allOptions.filter((o) => o.value !== "WALLET" || walletBalanceCents !== undefined);

  const isPlaceOrderDisabled =
    loading ||
    (paymentMethod === "PAYSTACK" && !hasSessionEmail && !paystackEmail?.trim()) ||
    (paymentMethod === "WALLET" &&
      (walletBalanceCents === null || (walletBalanceCents ?? 0) < orderTotalCents));

  return (
    <div className="space-y-6">
      {isFirstOrder && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <p className="font-medium text-foreground">First order? Use M-Pesa or pay via till</p>
          <p className="mt-1 text-muted-foreground">
            Cash on delivery is available after your first completed order. Need help?{" "}
            <a
              href="sms:+254721530181"
              className="font-medium text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary"
            >
              Text or WhatsApp +254721530181
            </a>
          </p>
        </div>
      )}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Choose payment method</p>
        <div className="grid gap-3">
          {options.map((opt) => {
            const Icon = paymentIcons[opt.value];
            const selected = paymentMethod === opt.value;
            const isDisabled = opt.disabled === true;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !isDisabled && setPaymentMethod(opt.value)}
                disabled={isDisabled}
                className={`flex w-full items-center gap-4 rounded-xl border-2 bg-card p-4 text-left shadow-sm transition-all ${
                  isDisabled
                    ? "cursor-not-allowed border-border opacity-60"
                    : "cursor-pointer hover:border-primary/40 hover:shadow-md " +
                      (selected
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "border-border")
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg overflow-hidden ${
                    opt.value === "PAYSTACK"
                      ? "bg-transparent"
                      : selected && !isDisabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {opt.value === "PAYSTACK" ? (
                    <MpesaIcon className="h-11 w-11" />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  <p
                    className={`text-sm ${opt.disabledReason ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {opt.disabledReason ?? opt.description}
                  </p>
                </div>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                  } ${selected ? "flex items-center justify-center" : ""}`}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {paymentMethod === "PAYSTACK" && !hasSessionEmail && (
        <div className="rounded-xl border border-border bg-card p-4">
          <label htmlFor="paystack-email" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email for payment receipt
          </label>
          <input
            id="paystack-email"
            type="email"
            value={paystackEmail}
            onChange={(e) => onPaystackEmailChange?.(e.target.value)}
            placeholder="you@example.com"
            className="mt-3 w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isPlaceOrderDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {paymentMethod === "PAYSTACK" ? "Redirecting…" : "Placing order…"}
            </>
          ) : (
            "Place order"
          )}
        </button>
      </div>
    </div>
  );
}
