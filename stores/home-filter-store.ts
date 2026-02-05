"use client";

import { create } from "zustand";

interface HomeFilterStore {
  categorySlug: string | null;
  setCategory: (slug: string | null) => void;
}

export const useHomeFilterStore = create<HomeFilterStore>((set) => ({
  categorySlug: null,
  setCategory: (slug) => set({ categorySlug: slug }),
}));
