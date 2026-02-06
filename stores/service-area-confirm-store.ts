"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";

export interface PendingAdd {
  product: Product;
  quantity: number;
  variantId?: number;
  onConfirm: () => void;
}

interface ServiceAreaConfirmStore {
  isOpen: boolean;
  pending: PendingAdd | null;
  open: (payload: PendingAdd) => void;
  close: () => void;
  confirm: () => void;
}

export const useServiceAreaConfirmStore = create<ServiceAreaConfirmStore>((set, get) => ({
  isOpen: false,
  pending: null,
  open: (payload) => set({ isOpen: true, pending: payload }),
  close: () => set({ isOpen: false, pending: null }),
  confirm: () => {
    const { pending } = get();
    if (pending) {
      pending.onConfirm();
    }
    set({ isOpen: false, pending: null });
  },
}));
