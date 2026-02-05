import Link from "next/link";
import { Flame } from "lucide-react";
import type { Product } from "@/types/product";

interface DealsCarouselProps {
  deals: Product[];
}

export function DealsCarousel({ deals }: DealsCarouselProps) {
  const displayDeals = deals.slice(0, 10);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-3 sm:mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
          <Flame className="h-3.5 w-3.5" aria-hidden />
          Deals
        </span>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          Today&apos;s offers
        </h2>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:gap-5">
        {displayDeals.map((product) => {
          const imageUrl = product.images?.[0]?.url;
          const price = product.priceCents / 100;
          const comparePrice = product.compareAtCents! / 100;
          const discount = Math.round((1 - price / comparePrice) * 100);

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group relative flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl bg-card shadow-md ring-1 ring-black/5 transition hover:shadow-lg hover:ring-primary/20 sm:w-40"
            >
              <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
                -{discount}%
              </span>
              <div className="aspect-square overflow-hidden bg-muted/30">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <span className="text-3xl" aria-hidden>🛒</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
                  {product.name}
                </p>
                <p className="mt-2 text-sm font-bold text-primary">
                  KES {price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  KES {comparePrice.toLocaleString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
