"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">Order Placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you for your order. We&apos;ll be in touch soon.
      </p>

      {orderNumber && (
        <p className="mt-4 rounded-md bg-muted px-4 py-3 font-mono text-lg font-semibold text-foreground">
          {orderNumber}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/products"
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          Continue Shopping
        </Link>
        <Link
          href="/orders"
          className="rounded-md border border-border px-6 py-3 font-medium text-foreground hover:bg-accent"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-lg px-4 py-16 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
