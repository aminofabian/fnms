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
    <aside
      className="flex w-full shrink-0 flex-col lg:w-56"
      style={{
        background: "linear-gradient(180deg, rgba(26, 109, 71, 0.12) 0%, rgba(26, 109, 71, 0.06) 50%, rgba(255, 255, 255, 0.4) 100%)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.2), 2px 0 8px -2px rgba(0,0,0,0.06)",
      }}
    >
      <nav className="flex-1 px-2 py-3 lg:px-3">
        {categories.map((cat) => {
          const Icon = getIcon(cat.slug);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:border-primary/20 hover:bg-white/60 hover:text-foreground"
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-md object-cover ring-1 ring-black/8"
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-primary/80" />
              )}
              <span className="truncate">{cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
