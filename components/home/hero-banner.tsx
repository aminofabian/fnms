"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { useServiceAreaStore } from "@/stores/service-area-store";
import { AreaChecker } from "@/components/service-areas/area-checker";
import type { ServiceArea } from "@/types/service-area";

interface HeroBannerProps {
  areas: ServiceArea[];
}

export function HeroBanner({ areas }: HeroBannerProps) {
  const { selectedArea, setSelectedArea } = useServiceAreaStore();
  const [search, setSearch] = useState("");
  const [showAreaChecker, setShowAreaChecker] = useState(false);

  function handleAreaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    const area = areas.find((a) => a.id === id);
    setSelectedArea(area ?? null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search.trim())}`;
    }
  }

  function handleAreaFound(areaName: string) {
    const area = areas.find((a) => a.name.toLowerCase() === areaName.toLowerCase());
    if (area) setSelectedArea(area);
  }

  return (
    <section className="relative overflow-hidden border-b border-black/10 bg-gradient-to-br from-background via-background to-primary/5">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container relative mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Main headline — focus on delivery area */}
          <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Do we deliver to you?
          </h1>
          <p className="mt-2 text-center text-muted-foreground sm:text-lg">
            Select or check your area to see delivery options and shop
          </p>

          {/* Primary: Area selector */}
          <div className="mt-6">
            <label htmlFor="delivery-area" className="mb-2 block text-sm font-medium text-foreground">
              Your delivery area
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
              <select
                id="delivery-area"
                value={selectedArea?.id ?? 0}
                onChange={handleAreaChange}
                aria-label="Select your delivery area"
                className="w-full appearance-none rounded-xl border border-black/10 bg-card py-3.5 pl-11 pr-10 text-base font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={0}>Choose your area...</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                    {area.estimatedTime ? ` · ${area.estimatedTime}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
            </div>
            {selectedArea && (
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedArea.deliveryFeeCents > 0
                  ? `Delivery: KES ${(selectedArea.deliveryFeeCents / 100).toLocaleString()}`
                  : "Free delivery"}
                {selectedArea.minOrderCents > 0 &&
                  ` · Min order KES ${(selectedArea.minOrderCents / 100).toLocaleString()}`}
              </p>
            )}
          </div>

          {/* Secondary: Check your area (collapsible) */}
          {areas.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAreaChecker(!showAreaChecker)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAreaChecker ? "Hide" : "Not sure? Check if your area is covered"}
              </button>
              {showAreaChecker && (
                <div className="mt-3">
                  <AreaChecker onAreaFound={handleAreaFound} />
                </div>
              )}
            </div>
          )}

          {/* Link to all areas */}
          {areas.length > 0 && (
            <p className="mt-4 text-center">
              <Link
                href="/delivery-areas"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                View all delivery locations
              </Link>
            </p>
          )}

          {/* Search — tertiary, below the fold of the hero */}
          <form onSubmit={handleSearch} className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-xl border border-black/10 bg-card/80 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>
      </div>
    </section>
  );
}
