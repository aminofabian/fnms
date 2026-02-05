import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url;
  const price = product.priceCents / 100;
  const comparePrice = product.compareAtCents != null ? product.compareAtCents / 100 : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary hover:shadow-md"
    >
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt ?? product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!product.stockQuantity && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            KES {price.toLocaleString()}
          </span>
          {comparePrice != null && comparePrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              KES {comparePrice.toLocaleString()}
            </span>
          )}
        </div>
        {product.unit && (
          <p className="mt-1 text-xs text-muted-foreground">per {product.unit}</p>
        )}
      </div>
    </Link>
  );
}
