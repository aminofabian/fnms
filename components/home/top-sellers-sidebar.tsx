"use client";

import Link from "next/link";
import {
  Percent,
  Package,
  Leaf,
  Coffee,
  UtensilsCrossed,
  SprayCan,
  Pen,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import type { Category } from "@/types/category";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Package,
  promos: Percent,
  vegetables: Leaf,
  "fruits-vegetables": Leaf,
  beverage: Coffee,
  beverages: Coffee,
  snacks: UtensilsCrossed,
  cleaning: SprayCan,
  stationery: Pen,
  beauty: Sparkles,
  "personal-care": Sparkles,
};

function getIcon(slug: string) {
  const key = slug.toLowerCase();
  for (const [k, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return LayoutGrid;
}

interface TopSellersSidebarProps {
  categories: Category[];
}

export function TopSellersSidebar({ categories }: TopSellersSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div
        className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        Top Sellers
      </div>
      <nav className="border border-t-0 border-border bg-card">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Percent className="h-4 w-4 shrink-0 text-primary" />
          Promos
        </Link>
        {categories.map((cat) => {
          const Icon = getIcon(cat.slug);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground last:border-b-0"
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded object-cover"
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {cat.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
