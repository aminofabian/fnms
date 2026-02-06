export interface DeliveryInfo {
  serviceAreaId: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
}

export type PaymentMethod = "PAYSTACK" | "CASH_ON_DELIVERY" | "WALLET" | "TILL";

export interface CheckoutData extends DeliveryInfo {
  paymentMethod: PaymentMethod;
}

export type CheckoutStep = "delivery" | "review" | "payment";
