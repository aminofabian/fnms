"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { OrderItem } from "@/types/order";

interface ReorderButtonProps {
  items: OrderItem[];
}

export function ReorderButton({ items }: ReorderButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    setLoading(true);

    try {
      // Fetch product details for each item
      for (const item of items) {
        const res = await fetch(`/api/products/${item.productSlug}`);
        if (!res.ok) continue;
        
        const product = await res.json();
        if (product && product.stockQuantity > 0) {
          addItem(product, Math.min(item.quantity, product.stockQuantity));
        }
      }

      router.push("/cart");
    } catch (e) {
      console.error("Reorder error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Adding..." : "Reorder"}
    </button>
  );
}
