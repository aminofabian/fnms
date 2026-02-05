"use client";

import { useEffect, useState } from "react";
import { AreaCard } from "./area-card";
import { useServiceAreaStore } from "@/stores/service-area-store";
import type { ServiceArea } from "@/types/service-area";

export function AreaList() {
  const { selectedArea, setSelectedArea } = useServiceAreaStore();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service-areas")
      .then((res) => res.json())
      .then((data) => {
        setAreas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAreas([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (areas.length === 0) {
    return <p className="text-muted-foreground">No delivery areas available yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area) => (
        <AreaCard
          key={area.id}
          area={area}
          selected={selectedArea?.id === area.id}
          onSelect={setSelectedArea}
        />
      ))}
    </div>
  );
}
