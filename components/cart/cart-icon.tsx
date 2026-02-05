"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartIcon() {
  const count = useCartStore((s) => s.getItemCount());

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
