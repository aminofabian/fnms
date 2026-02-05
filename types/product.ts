import type { Category } from "./category";

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku: string | null;
  priceCents: number;
  stockQuantity: number;
}

export interface Product {
  id: number;
  categoryId: number;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  compareAtCents: number | null;
  unit: string | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductInput {
  categoryId: number;
  slug: string;
  name: string;
  description?: string;
  priceCents: number;
  compareAtCents?: number;
  unit?: string;
  stockQuantity?: number;
  isActive?: boolean;
}
