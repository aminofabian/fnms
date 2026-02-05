import { z } from "zod";

export const categorySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// For form usage with explicit types
export interface CategoryFormData {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}
