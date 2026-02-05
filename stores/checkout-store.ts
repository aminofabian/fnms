"use client";

import { create } from "zustand";
import type { DeliveryInfo, PaymentMethod, CheckoutStep } from "@/types/checkout";
import type { PromoValidation } from "@/types/promo";

interface CheckoutStore {
  step: CheckoutStep;
  delivery: DeliveryInfo | null;
  paymentMethod: PaymentMethod;
  promo: PromoValidation | null;
  setStep: (step: CheckoutStep) => void;
  setDelivery: (delivery: DeliveryInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPromo: (promo: PromoValidation | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  step: "delivery",
  delivery: null,
  paymentMethod: "CASH_ON_DELIVERY",
  promo: null,

  setStep: (step) => set({ step }),

  setDelivery: (delivery) => set({ delivery }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setPromo: (promo) => set({ promo }),

  reset: () =>
    set({
      step: "delivery",
      delivery: null,
      paymentMethod: "CASH_ON_DELIVERY",
      promo: null,
    }),
}));
