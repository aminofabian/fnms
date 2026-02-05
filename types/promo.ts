export interface PromoCode {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number; // percentage (0-100) or cents
  minOrderCents: number;
  maxUsageCount: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoValidation {
  valid: boolean;
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  discountCents?: number;
  message?: string;
}
