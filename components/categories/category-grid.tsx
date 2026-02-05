"use client";

import { useEffect, useState } from "react";
import { CategoryCard } from "./category-card";
import type { Category } from "@/types/category";

interface CategoryGridProps {
  categories?: Category[];
}

export function CategoryGrid({ categories: initialCategories }: CategoryGridProps) {
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No categories available yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
