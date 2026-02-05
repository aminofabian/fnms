"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function FabMenu() {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95"
      aria-label={itemCount > 0 ? `Cart (${itemCount} items)` : "Open cart"}
    >
      <Menu className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-primary">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
