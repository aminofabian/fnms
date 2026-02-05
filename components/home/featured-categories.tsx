import Link from "next/link";
import { ShoppingBasket, ChevronRight } from "lucide-react";
import type { Category } from "@/types/category";

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Shop by category
        </h2>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2 hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center rounded-2xl border border-black/10 bg-card p-4 text-center shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:ring-primary/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20 sm:h-14 sm:w-14">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt=""
                  className="h-8 w-8 rounded-xl object-cover sm:h-10 sm:w-10"
                />
              ) : (
                <ShoppingBasket className="h-7 w-7 text-primary sm:h-8 sm:w-8" aria-hidden />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
