import Link from "next/link";
import { Tag } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

interface DealsSectionProps {
  products: Product[];
}

export function DealsSection({ products }: DealsSectionProps) {
  // Filter products that have a compare price (meaning they're on sale)
  const dealsProducts = products.filter(
    (p) => p.compareAtCents && p.compareAtCents > p.priceCents
  );

  if (dealsProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-primary/10 via-orange-500/10 to-yellow-500/10 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[8px] font-bold uppercase tracking-wide text-foreground sm:text-[9px]">
                Today&apos;s Deals
              </h2>
              <p className="text-sm text-muted-foreground">
                Limited time offers on fresh products
              </p>
            </div>
          </div>
          <Link
            href="/products?deals=true"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all deals
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {dealsProducts.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
