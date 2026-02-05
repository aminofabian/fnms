"use client";

import { useCartStore } from "@/stores/cart-store";
import { CartItem } from "./cart-item";

export function CartItemList() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <CartItem key={`${item.productId}-${item.variantId ?? "base"}`} item={item} />
      ))}
    </div>
  );
}
