export interface CartItemSnapshot {
  productId: number;
  slug: string;
  name: string;
  priceCents: number; // can be variant price
  compareAtCents?: number | null; // original price for savings calc
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
