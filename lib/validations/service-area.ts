import { z } from "zod";

export const serviceAreaSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  deliveryFeeCents: z.number().int().min(0).default(0),
  minOrderCents: z.number().int().min(0).default(0),
  estimatedTime: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const areaRequestSchema = z.object({
  areaName: z.string().min(2, "Area name is required"),
  contactEmail: z.string().email("Invalid email"),
});

export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;
export type AreaRequestInput = z.infer<typeof areaRequestSchema>;
