import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryBreadcrumbProps {
  category?: Category;
  productName?: string;
}

export function CategoryBreadcrumb({ category, productName }: CategoryBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link href="/categories" className="hover:text-foreground">
        Categories
      </Link>
      {category && (
        <>
          <ChevronRight className="h-4 w-4" />
          {productName ? (
            <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          ) : (
            <span className="text-foreground">{category.name}</span>
          )}
        </>
      )}
      {productName && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1">{productName}</span>
        </>
      )}
    </nav>
  );
}
