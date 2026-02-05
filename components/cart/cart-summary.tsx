"use client";

import { useCartStore } from "@/stores/cart-store";
import { useServiceAreaStore } from "@/stores/service-area-store";
import Link from "next/link";

export function CartSummary() {
  const items = useCartStore((s) => s.items);
  const selectedArea = useServiceAreaStore((s) => s.selectedArea);
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());

  const deliveryFeeCents = selectedArea?.deliveryFeeCents ?? 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Summary</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-medium">
            {selectedArea ? `KES ${(deliveryFeeCents / 100).toLocaleString()}` : "Select area"}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-semibold">KES {((Number(totalCents) || 0) / 100).toLocaleString()}</dd>
        </div>
      </dl>
      <Link
        href="/checkout"
        className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
