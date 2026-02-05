"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartItemList } from "./cart-item-list";
import { CartSummary } from "./cart-summary";
import { CartEmpty } from "./cart-empty";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = useCartStore((s) => s.getItemCount());

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden sm:inline">Cart</span>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">Cart</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <CartEmpty />
              ) : (
                <CartItemList />
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-border p-4">
                <CartSummary />
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="mt-3 block text-center text-sm text-primary hover:underline"
                >
                  View full cart
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
