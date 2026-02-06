export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "AWAITING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "PAYSTACK" | "CASH_ON_DELIVERY" | "WALLET" | "TILL";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  unitPriceCents: number;
  productName?: string;
  productSlug?: string;
  productImageUrl?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  status: OrderStatus;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  serviceAreaId: number;
  serviceAreaName?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  itemCount: number;
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-orange-100 text-orange-800",
};
