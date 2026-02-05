import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/50 overflow-hidden">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-3 text-center font-medium text-foreground group-hover:text-primary">
        {category.name}
      </h3>
      {category.description && (
        <p className="mt-1 text-center text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}
    </Link>
  );
}
