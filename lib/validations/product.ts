import { z } from "zod";

export const productSchema = z.object({
  categoryId: z.number().int().positive(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
