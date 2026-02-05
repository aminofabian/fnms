"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { AreaCard } from "@/components/service-areas/area-card";
import { useServiceAreaStore } from "@/stores/service-area-store";
import type { ServiceArea } from "@/types/service-area";

interface DeliveryAreasBlockProps {
  areas: ServiceArea[];
}

export function DeliveryAreasBlock({ areas }: DeliveryAreasBlockProps) {
  const { selectedArea, setSelectedArea } = useServiceAreaStore();

  if (areas.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8" aria-label="Delivery locations">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Our delivery locations
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            We deliver to these areas — select yours above or pick one below
          </p>
        </div>
        <Link
          href="/delivery-areas"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.slice(0, 6).map((area) => (
          <AreaCard
            key={area.id}
            area={area}
            selected={selectedArea?.id === area.id}
            onSelect={setSelectedArea}
          />
        ))}
      </div>
    </section>
  );
}
