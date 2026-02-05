import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  viewAllHref?: string;
}

export function FeaturedProducts({
  products,
  title = "Featured Products",
  viewAllHref = "/products",
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h2>
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
