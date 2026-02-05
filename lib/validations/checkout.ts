import { z } from "zod";

export const deliverySchema = z.object({
  serviceAreaId: z.number().int().positive("Please select a delivery area"),
  recipientName: z.string().min(2, "Name must be at least 2 characters"),
  recipientPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+]+$/, "Invalid phone number"),
  deliveryAddress: z.string().min(5, "Address must be at least 5 characters"),
  deliveryNotes: z.string().optional(),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(["MPESA", "CASH_ON_DELIVERY"]),
});

export const checkoutSchema = deliverySchema.merge(paymentSchema);

export type DeliveryInput = z.infer<typeof deliverySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
