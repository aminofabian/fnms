"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { QuantitySelector } from "./quantity-selector";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  variantId?: number;
}

export function AddToCartButton({ product, variantId }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stockQuantity > 0;
  const maxQty = Math.min(product.stockQuantity, 99);

  function handleAddToCart() {
    if (!inStock) return;
    setAdding(true);
    addItem(product, quantity, variantId);
    setQuantity(1);
    setAdding(false);
  }

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-4 py-3 text-muted-foreground"
      >
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantitySelector
        value={quantity}
        max={maxQty}
        onChange={setQuantity}
      />
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding}
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <ShoppingCart className="h-5 w-5" />
        {adding ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
