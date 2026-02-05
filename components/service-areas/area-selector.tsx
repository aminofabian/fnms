"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useServiceAreaStore } from "@/stores/service-area-store";
import type { ServiceArea } from "@/types/service-area";

export function AreaSelector() {
  const { selectedArea, setSelectedArea } = useServiceAreaStore();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service-areas")
      .then((res) => res.json())
      .then((data) => {
        setAreas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSelect(area: ServiceArea) {
    setSelectedArea(area);
    setOpen(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-between gap-3 lg:w-auto">
      <div className="flex flex-1 items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm text-muted-foreground">
          Deliver to{" "}
          <span className="font-semibold text-foreground">{selectedArea?.name ?? "Select area"}</span>
        </span>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground lg:rounded-md lg:bg-transparent lg:px-2 lg:py-1.5 lg:text-primary lg:hover:bg-accent"
      >
        Change
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-md border border-border bg-card shadow-lg">
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                Delivery Areas
              </p>
              {areas.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No areas available</p>
              ) : (
                areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleSelect(area)}
                    className={`w-full flex items-center justify-between rounded-md px-2 py-2 text-sm text-left hover:bg-accent transition-colors ${
                      selectedArea?.id === area.id ? "bg-accent" : ""
                    }`}
                  >
                    <span>{area.name}</span>
                    {area.deliveryFeeCents > 0 && (
                      <span className="text-xs text-muted-foreground">
                        KES {(area.deliveryFeeCents / 100).toFixed(0)} delivery
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
