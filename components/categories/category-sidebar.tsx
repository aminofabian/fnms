"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/category";

interface CategorySidebarProps {
  categories?: Category[];
}

export function CategorySidebar({ categories: initialCategories }: CategorySidebarProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories) return;

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [initialCategories]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      <Link
        href="/categories"
        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          pathname === "/categories"
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent"
        }`}
      >
        All Categories
      </Link>
      {categories.map((category) => {
        const isActive = pathname === `/categories/${category.slug}`;
        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
