"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { invalidateWishlist } from "@/lib/wishlist";
import { WishlistItem } from "./wishlist-item";

interface WishlistProduct {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
}

interface WishlistItemData {
  id: number;
  productId: number;
  product: WishlistProduct;
}

export function WishlistList() {
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleRemove(productId: number) {
    setRemoving(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        invalidateWishlist();
      }
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Your wishlist is empty
        </h2>
        <p className="mt-1 text-muted-foreground">
          Save items you love to your wishlist
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WishlistItem
          key={item.id}
          id={item.id}
          productId={item.productId}
          product={item.product}
          onRemove={handleRemove}
          removing={removing === item.productId}
        />
      ))}
    </div>
  );
}
