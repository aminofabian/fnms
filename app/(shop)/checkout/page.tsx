"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { DeliveryForm } from "@/components/checkout/delivery-form";
import { ReviewStep } from "@/components/checkout/review-step";
import { PaymentMethod } from "@/components/checkout/payment-method";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { useServiceAreaStore } from "@/stores/service-area-store";
import Link from "next/link";
import type { CheckoutStep } from "@/types/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { step, setStep, delivery, paymentMethod, reset: resetCheckout } = useCheckoutStore();
  const { items, clearCart, getSubtotalCents } = useCartStore();
  const { selectedArea } = useServiceAreaStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some items before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  function goToStep(s: CheckoutStep) {
    setStep(s);
    setError(null);
  }

  async function handlePlaceOrder() {
    if (!delivery || !selectedArea) {
      setError("Please complete delivery information.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            priceCents: item.snapshot.priceCents,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create order");
      }

      const { orderNumber } = await res.json();

      // Clear stores
      clearCart();
      resetCheckout();

      router.push(`/checkout/success?order=${orderNumber}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Checkout</h1>

      <div className="mb-8">
        <CheckoutSteps currentStep={step} />
      </div>

      {error && (
        <p className="mb-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === "delivery" && <DeliveryForm onNext={() => goToStep("review")} />}

      {step === "review" && (
        <ReviewStep onBack={() => goToStep("delivery")} onNext={() => goToStep("payment")} />
      )}

      {step === "payment" && (
        <PaymentMethod
          onBack={() => goToStep("review")}
          onPlaceOrder={handlePlaceOrder}
          loading={loading}
        />
      )}
    </div>
  );
}
