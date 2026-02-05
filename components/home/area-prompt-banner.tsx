"use client";

import { MapPin } from "lucide-react";
import { useServiceAreaStore } from "@/stores/service-area-store";

export function AreaPromptBanner() {
  const selectedArea = useServiceAreaStore((s) => s.selectedArea);

  if (selectedArea) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
    >
      <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p>
        <strong>Select your delivery area</strong> above or from the list below to see delivery fees and checkout.
      </p>
    </div>
  );
}
