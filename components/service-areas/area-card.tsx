import { MapPin, Clock, Truck } from "lucide-react";
import type { ServiceArea } from "@/types/service-area";

interface AreaCardProps {
  area: ServiceArea;
  onSelect?: (area: ServiceArea) => void;
  selected?: boolean;
}

export function AreaCard({ area, onSelect, selected }: AreaCardProps) {
  return (
    <div
      onClick={() => onSelect?.(area)}
      className={`rounded-xl border p-3 transition-all ${
        onSelect ? "cursor-pointer hover:border-primary hover:shadow-md" : ""
      } ${selected ? "border-primary bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{area.name}</h3>
        </div>
        {!area.isActive && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Paused
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Truck className="h-4 w-4" />
          <span>
            {area.deliveryFeeCents > 0
              ? `KES ${(area.deliveryFeeCents / 100).toFixed(0)} delivery`
              : "Free delivery"}
          </span>
        </div>
        {area.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{area.estimatedTime}</span>
          </div>
        )}
      </div>

      {area.minOrderCents > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Min order: KES {(area.minOrderCents / 100).toFixed(0)}
        </p>
      )}
    </div>
  );
}
