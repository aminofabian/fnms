"use client";

import { useHomeFilterStore } from "@/stores/home-filter-store";
import { DealsCarousel } from "./deals-carousel";
import type { Product } from "@/types/product";

interface HomeDealsSectionProps {
  deals: Product[];
}

export function HomeDealsSection({ deals }: HomeDealsSectionProps) {
  const categorySlug = useHomeFilterStore((s) => s.categorySlug);

  // Only show deals when "All" is selected (no category filter)
  if (categorySlug || deals.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-8 sm:mb-10"
      aria-labelledby="deals-heading"
    >
      <DealsCarousel deals={deals} />
    </section>
  );
}
