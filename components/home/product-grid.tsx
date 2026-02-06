"use client";

import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/wishlist";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  title?: string;
  titleId?: string;
  titleClassName?: string;
}

export function ProductGrid({ products, title, titleId, titleClassName }: ProductGridProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success("Added to cart", { description: product.name });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-card/50 py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
          <Package className="h-10 w-10 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No products yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon for fresh products!
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2
          id={titleId}
          className={`mb-5 text-lg font-semibold text-foreground sm:text-xl ${titleClassName ?? ""}`}
        >
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => {
          const imageUrl = product.images?.[0]?.url;
          const price = product.priceCents / 100;
          const comparePrice = product.compareAtCents ? product.compareAtCents / 100 : null;
          const discount = comparePrice ? Math.round((1 - price / comparePrice) * 100) : null;
          const inStock = product.stockQuantity > 0;

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md hover:ring-primary/15"
            >
              {discount && discount > 0 && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                  -{discount}%
                </span>
              )}

              <div className="relative aspect-square overflow-hidden bg-muted/30">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <Package className="h-10 w-10" aria-hidden />
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {product.name}
                </h3>
                {product.unit && (
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    per {product.unit}
                  </span>
                )}
                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                  <div className="min-w-0">
                    <span className="text-base font-bold text-foreground">
                      KES {price.toLocaleString()}
                    </span>
                    {comparePrice && comparePrice > price && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <WishlistButton productId={product.id} size="sm" />
                    {inStock && (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
