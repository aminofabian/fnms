"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { QuantitySelector } from "@/components/products/quantity-selector";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const price = ((Number(item.snapshot.priceCents) || 0) * (item.quantity || 0)) / 100;
  const maxQty = Math.min(item.snapshot.stockQuantity || 99, 99);

  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <Link href={`/products/${item.snapshot.slug}`} className="shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted">
          {item.snapshot.imageUrl ? (
            <img
              src={item.snapshot.imageUrl}
              alt={item.snapshot.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.snapshot.slug}`} className="font-medium text-foreground hover:text-primary line-clamp-2">
          {item.snapshot.name}
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">
          KES {((Number(item.snapshot.priceCents) || 0) / 100).toLocaleString()}
          {item.snapshot.unit && ` per ${item.snapshot.unit}`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <QuantitySelector
            value={item.quantity}
            max={maxQty}
            onChange={(q) => updateQuantity(item.productId, q, item.variantId)}
          />
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variantId)}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold text-foreground">KES {price.toLocaleString()}</p>
      </div>
    </div>
  );
}
