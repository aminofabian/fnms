import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PromoValidation } from "@/types/promo";

// POST /api/promo/validate - Validate a promo code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotalCents } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: "Promo code is required",
      });
    }

    if (!subtotalCents || typeof subtotalCents !== "number") {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: "Order subtotal is required",
      });
    }

    // Find promo code
    const { rows } = await db.execute({
      sql: `SELECT * FROM promo_codes WHERE code = ? COLLATE NOCASE LIMIT 1`,
      args: [code.toUpperCase()],
    });

    if (rows.length === 0) {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: "Invalid promo code",
      });
    }

    const promo = rows[0] as Record<string, unknown>;

    // Check if active
    if (!promo.is_active) {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: "This promo code is no longer active",
      });
    }

    // Check date validity
    const now = new Date();
    if (promo.starts_at) {
      const startsAt = new Date(String(promo.starts_at));
      if (now < startsAt) {
        return NextResponse.json<PromoValidation>({
          valid: false,
          message: "This promo code is not yet active",
        });
      }
    }

    if (promo.expires_at) {
      const expiresAt = new Date(String(promo.expires_at));
      if (now > expiresAt) {
        return NextResponse.json<PromoValidation>({
          valid: false,
          message: "This promo code has expired",
        });
      }
    }

    // Check usage limit
    const maxUsage = promo.max_usage_count !== null ? Number(promo.max_usage_count) : null;
    const currentUsage = Number(promo.usage_count) || 0;
    if (maxUsage !== null && currentUsage >= maxUsage) {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: "This promo code has reached its usage limit",
      });
    }

    // Check minimum order
    const minOrderCents = Number(promo.min_order_cents) || 0;
    if (subtotalCents < minOrderCents) {
      return NextResponse.json<PromoValidation>({
        valid: false,
        message: `Minimum order of KES ${(minOrderCents / 100).toLocaleString()} required`,
      });
    }

    // Calculate discount
    const discountType = String(promo.discount_type) as "PERCENTAGE" | "FIXED_AMOUNT";
    const discountValue = Number(promo.discount_value);
    let discountCents = 0;

    if (discountType === "PERCENTAGE") {
      discountCents = Math.round(subtotalCents * (discountValue / 100));
    } else {
      discountCents = discountValue;
    }

    // Don't let discount exceed subtotal
    discountCents = Math.min(discountCents, subtotalCents);

    return NextResponse.json<PromoValidation>({
      valid: true,
      code: String(promo.code),
      discountType,
      discountValue,
      discountCents,
    });
  } catch (error) {
    console.error("Promo validate error:", error);
    return NextResponse.json<PromoValidation>({
      valid: false,
      message: "Failed to validate promo code",
    });
  }
}
