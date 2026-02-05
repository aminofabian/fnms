"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pt-1">
      <Link
        href="/"
        className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          !activeSlug
            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
            : "bg-card text-foreground shadow-sm ring-1 ring-black/5 hover:bg-white hover:ring-primary/20"
        }`}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        All
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                : "bg-card text-foreground shadow-sm ring-1 ring-black/5 hover:bg-white hover:ring-primary/20"
            }`}
          >
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt=""
                className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-black/5"
              />
            ) : null}
            <span className="whitespace-nowrap">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
