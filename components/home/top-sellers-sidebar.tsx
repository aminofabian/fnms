"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Percent,
  Package,
  Leaf,
  Coffee,
  UtensilsCrossed,
  SprayCan,
  Pen,
  Sparkles,
  LayoutGrid,
  Wheat,
  Candy,
  Square,
  Droplets,
  Milk,
  Drumstick,
  Croissant,
} from "lucide-react";
import { useHomeFilterStore } from "@/stores/home-filter-store";
import type { Category } from "@/types/category";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Package,
  promos: Percent,
  flour: Wheat,
  sugar: Candy,
  margarine: Square,
  oil: Droplets,
  "cooking-oil": Droplets,
  rice: Package,
  vegetables: Leaf,
  "fruits-vegetables": Leaf,
  dairy: Milk,
  "dairy-eggs": Milk,
  meat: Drumstick,
  poultry: Drumstick,
  "meat-poultry": Drumstick,
  bread: Croissant,
  bakery: Croissant,
  "bread-bakery": Croissant,
  beverage: Coffee,
  beverages: Coffee,
  snacks: UtensilsCrossed,
  cleaning: SprayCan,
  household: SprayCan,
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

const MOBILE_VISIBLE = 8;

export function TopSellersSidebar({ categories }: TopSellersSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const setCategory = useHomeFilterStore((s) => s.setCategory);
  const selectedSlug = useHomeFilterStore((s) => s.categorySlug);
  const hasMore = categories.length > MOBILE_VISIBLE;
  const visibleCategories = expanded ? categories : categories.slice(0, MOBILE_VISIBLE);

  return (
    <aside
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl lg:h-[400px] lg:w-56 lg:rounded-none lg:rounded-l-lg"
      style={{
        background: "linear-gradient(180deg, rgba(26, 109, 71, 0.08) 0%, rgba(255,255,255,0.95) 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: "1px solid rgba(26, 109, 71, 0.15)",
      }}
    >
      {/* Mobile: compact grid, 8 visible + expand */}
      <nav className="grid flex-1 grid-cols-4 gap-2 p-3 lg:hidden">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2.5 text-center text-[11px] font-semibold shadow-sm ring-1 transition-all hover:ring-primary/30 hover:shadow-md active:scale-[0.98] ${
            !selectedSlug ? "ring-2 ring-primary text-primary" : "ring-black/5 text-foreground"
          }`}
        >
          <LayoutGrid className="h-5 w-5 shrink-0 text-primary/80" />
          <span className="truncate w-full leading-tight">All</span>
        </button>
        {visibleCategories.map((cat) => {
          const Icon = getIcon(cat.slug);
          const isActive = selectedSlug === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(isActive ? null : cat.slug)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2.5 text-center text-[11px] font-semibold shadow-sm ring-1 transition-all hover:ring-primary/30 hover:shadow-md active:scale-[0.98] ${
                isActive
                  ? "ring-2 ring-primary text-primary"
                  : "ring-black/5 text-foreground"
              }`}
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <span className="truncate w-full leading-tight">{cat.name}</span>
            </button>
          );
        })}
      </nav>
      {/* Desktop: vertical list, scrollable, fills 400px banner height */}
      <nav className="hidden flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-2 lg:flex lg:min-h-0 lg:flex-col lg:p-3">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            !selectedSlug ? "bg-primary/10 text-primary" : "text-foreground hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="truncate">All</span>
        </button>
        {categories.map((cat) => {
          const Icon = getIcon(cat.slug);
          const isActive = selectedSlug === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(isActive ? null : cat.slug)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-md object-cover ring-1 ring-black/5"
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-primary/70" />
              )}
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </nav>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mx-2 mb-2 flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 lg:hidden"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              +{categories.length - MOBILE_VISIBLE} more
            </>
          )}
        </button>
      )}
    </aside>
  );
}
