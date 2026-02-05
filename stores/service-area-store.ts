"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ServiceArea } from "@/types/service-area";

interface ServiceAreaStore {
  selectedArea: ServiceArea | null;
  setSelectedArea: (area: ServiceArea | null) => void;
}

export const useServiceAreaStore = create<ServiceAreaStore>()(
  persist(
    (set) => ({
      selectedArea: null,
      setSelectedArea: (area) => set({ selectedArea: area }),
    }),
    { name: "service-area" }
  )
);
