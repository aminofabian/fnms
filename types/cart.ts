export interface CartItemSnapshot {
  productId: number;
  slug: string;
  name: string;
  priceCents: number; // can be variant price
  imageUrl: string | null;
  unit: string | null;
  stockQuantity: number;
}

export interface CartItem {
  productId: number;
  variantId?: number;
  quantity: number;
  snapshot: CartItemSnapshot;
}

export interface Cart {
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
}
