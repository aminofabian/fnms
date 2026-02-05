import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const price = product.priceCents / 100;
  const comparePrice = product.compareAtCents != null ? product.compareAtCents / 100 : null;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold text-foreground">
          KES {price.toLocaleString()}
        </span>
        {comparePrice != null && comparePrice > price && (
          <span className="text-lg text-muted-foreground line-through">
            KES {comparePrice.toLocaleString()}
          </span>
        )}
        {product.unit && (
          <span className="text-sm text-muted-foreground">per {product.unit}</span>
        )}
      </div>

      {product.description && (
        <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
      )}

      <div className="flex items-center gap-2">
        {inStock ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            In stock
          </span>
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            Out of stock
          </span>
        )}
      </div>
    </div>
  );
}
