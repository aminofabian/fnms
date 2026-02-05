"use client";

import { CartItemList } from "@/components/cart/cart-item-list";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartEmpty } from "@/components/cart/cart-empty";
import { useCartStore } from "@/stores/cart-store";

export function CartPageClient() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card p-4">
        <CartItemList />
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummary />
      </div>
    </div>
  );
}
