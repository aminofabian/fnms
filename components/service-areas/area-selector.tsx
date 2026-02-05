"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
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
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col items-start gap-0 rounded-md px-2 py-1.5 text-left hover:bg-accent sm:flex-row sm:items-center sm:gap-1.5 sm:px-3 sm:py-2"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-xs text-foreground sm:text-sm">Deliver to</span>
        </div>
        <span className="text-xs font-semibold text-primary sm:text-sm">
          {selectedArea?.name ?? "Select area"}
        </span>
        <span className="text-xs font-medium text-primary underline sm:ml-0.5">Change</span>
        <ChevronDown className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground sm:static sm:translate-y-0" />
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
