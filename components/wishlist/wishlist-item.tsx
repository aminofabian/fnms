"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/product";

interface WishlistProduct {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
}

function toProduct(productId: number, p: WishlistProduct): Product {
  return {
    id: productId,
    categoryId: 0,
    slug: p.slug,
    name: p.name,
    description: null,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtPriceCents,
    unit: null,
    stockQuantity: p.stockQuantity,
    isActive: p.isActive,
    createdAt: "",
    updatedAt: "",
    images: p.imageUrl ? [{ id: 0, productId, url: p.imageUrl, alt: null, sortOrder: 0 }] : [],
  };
}

interface WishlistItemProps {
  id: number;
  productId: number;
  product: WishlistProduct;
  onRemove: (productId: number) => void;
  removing: boolean;
}

export function WishlistItem({
  productId,
  product,
  onRemove,
  removing,
}: WishlistItemProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const inStock = product.stockQuantity > 0 && product.isActive;

  function handleAddToCart() {
    if (!inStock) return;
    addToCart(toProduct(productId, product), 1);
  }

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            KES {(product.priceCents / 100).toLocaleString()}
          </span>
          {product.compareAtPriceCents && (
            <span className="text-sm text-muted-foreground line-through">
              KES {(product.compareAtPriceCents / 100).toLocaleString()}
            </span>
          )}
        </div>

        {!inStock && (
          <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {product.stockQuantity === 0 ? "Out of stock" : "Unavailable"}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            onClick={() => onRemove(productId)}
            disabled={removing}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
