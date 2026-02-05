"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function QuickCart() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const subtotalCents = items.reduce((sum, item) => {
    const price = item.snapshot?.priceCents || 0;
    const qty = item.quantity || 0;
    return sum + price * qty;
  }, 0);

  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-xl ring-2 ring-primary/20 transition hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] sm:bottom-8 sm:px-6 sm:py-3.5 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label={`View cart, ${totalItems} items, KES ${(subtotalCents / 100).toLocaleString()}`}
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden />
        <span className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-sm">
          {totalItems}
        </span>
      </div>
      <span className="font-semibold tabular-nums">
        KES {(subtotalCents / 100).toLocaleString()}
      </span>
      <span className="rounded-full bg-white/20 px-2.5 py-1 text-sm font-medium sm:px-3">
        View Cart
      </span>
    </Link>
  );
}
