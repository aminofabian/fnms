"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/products/product-image";
import { ProductInfo } from "@/components/products/product-info";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist";

interface ProductQuickViewModalProps {
  product: Product;
}

export function ProductQuickViewModal({ product }: ProductQuickViewModalProps) {
  const router = useRouter();
  const mainImage = product.images?.[0];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function closeModal() {
    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${product.name}`}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-3 top-3 z-10 rounded-lg bg-background/90 p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close quick view"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted/30">
            <ProductImage
              src={mainImage?.url ?? null}
              alt={mainImage?.alt ?? product.name}
              className="h-full w-full"
            />
          </div>

          <div>
            <ProductInfo product={product} />
            <div className="mt-6 flex items-center gap-4">
              <AddToCartButton product={product} />
              <WishlistButton productId={product.id} size="lg" />
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="mt-6 inline-block text-sm text-primary hover:underline"
            >
              View full product page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
