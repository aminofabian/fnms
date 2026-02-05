"use client";

import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartFooterBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());
  const subtotal = (Number(subtotalCents) || 0) / 100;

  return (
    <Link
      href="/cart"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center transition hover:opacity-95 active:opacity-90"
      style={{
        background: "linear-gradient(180deg, #1A5A3C 0%, var(--nav-green) 100%)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.15), 0 -1px 0 rgba(255,255,255,0.1) inset",
      }}
      aria-label="Cart summary"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 w-full sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
            <ShoppingCart className="h-5 w-5 text-white" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground shadow">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/95">
              {itemCount === 0
                ? "Cart is empty"
                : itemCount === 1
                  ? "1 item in cart"
                  : `${itemCount} items in cart`}
            </p>
            <p className="text-base font-bold tracking-tight text-white">
              KES {subtotal.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
          View cart
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
