"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { CartItem, CartItemSnapshot } from "@/types/cart";

function makeSnapshot(product: Product, priceCents?: number): CartItemSnapshot {
  const cents = Number(priceCents ?? product.priceCents) || 0;
  const compareAt = product.compareAtCents != null ? Number(product.compareAtCents) : null;
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: cents,
    compareAtCents: compareAt != null && compareAt > cents ? compareAt : null,
    imageUrl: product.images?.[0]?.url ?? null,
    unit: product.unit ?? null,
    stockQuantity: Number(product.stockQuantity) || 0,
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variantId?: number) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getSubtotalCents: () => number;
  getSavedCents: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, variantId) => {
        if (quantity < 1) return;
        const priceCents = Number(
          variantId
            ? product.variants?.find((v) => v.id === variantId)?.priceCents ?? product.priceCents
            : product.priceCents
        ) || 0;
        const snapshot = makeSnapshot(product, priceCents);
        set((state) => {
          const existing = state.items.findIndex(
            (i) => i.productId === product.id && (i.variantId ?? undefined) === (variantId ?? undefined)
          );
          let next: CartItem[];
          if (existing >= 0) {
            next = state.items.map((item, i) =>
              i === existing
                ? {
                    ...item,
                    quantity: Math.min(item.quantity + quantity, item.snapshot.stockQuantity || 99),
                  }
                : item
            );
          } else {
            next = [
              ...state.items,
              {
                productId: product.id,
                variantId,
                quantity: Math.min(quantity, product.stockQuantity || 99),
                snapshot,
              },
            ];
          }
          return { items: next };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (i.variantId ?? undefined) === (variantId ?? undefined))
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && (item.variantId ?? undefined) === (variantId ?? undefined)
              ? { ...item, quantity: Math.min(quantity, item.snapshot.stockQuantity || 99) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotalCents: () => {
        return get().items.reduce(
          (sum, i) => sum + (Number(i.snapshot.priceCents) || 0) * (i.quantity || 0),
          0
        );
      },

      getSavedCents: () => {
        return get().items.reduce((sum, i) => {
          const compare = i.snapshot.compareAtCents ?? null;
          if (compare == null || compare <= (Number(i.snapshot.priceCents) || 0)) return sum;
          const diff = compare - (Number(i.snapshot.priceCents) || 0);
          return sum + diff * (i.quantity || 0);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((n, i) => n + i.quantity, 0);
      },
    }),
    { name: "cart" }
  )
);
