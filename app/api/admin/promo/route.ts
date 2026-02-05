import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { PromoCode } from "@/types/promo";

const promoSchema = z.object({
  code: z.string().min(3).max(20).transform((v) => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive(),
  minOrderCents: z.number().min(0).default(0),
  maxUsageCount: z.number().int().positive().nullable().default(null),
  startsAt: z.string().nullable().default(null),
  expiresAt: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});

function rowToPromo(row: Record<string, unknown>): PromoCode {
  return {
    id: Number(row.id),
    code: String(row.code),
    discountType: String(row.discount_type) as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: Number(row.discount_value),
    minOrderCents: Number(row.min_order_cents) || 0,
    maxUsageCount: row.max_usage_count !== null ? Number(row.max_usage_count) : null,
    usageCount: Number(row.usage_count) || 0,
    startsAt: row.starts_at ? String(row.starts_at) : null,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// GET /api/admin/promo - List all promo codes
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await db.execute({
      sql: "SELECT * FROM promo_codes ORDER BY created_at DESC",
      args: [],
    });

    const promos = rows.map((row) => rowToPromo(row as Record<string, unknown>));
    return NextResponse.json(promos);
  } catch (error) {
    console.error("Promo GET error:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

// POST /api/admin/promo - Create promo code
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = promoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check for duplicate code
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM promo_codes WHERE code = ? LIMIT 1",
      args: [data.code],
    });

    if (existing.length > 0) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }

    await db.execute({
      sql: `INSERT INTO promo_codes (code, discount_type, discount_value, min_order_cents, max_usage_count, starts_at, expires_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.code,
        data.discountType,
        data.discountValue,
        data.minOrderCents,
        data.maxUsageCount,
        data.startsAt,
        data.expiresAt,
        data.isActive ? 1 : 0,
      ],
    });

    // Fetch created promo
    const { rows } = await db.execute({
      sql: "SELECT * FROM promo_codes WHERE code = ? LIMIT 1",
      args: [data.code],
    });

    return NextResponse.json(rowToPromo(rows[0] as Record<string, unknown>), { status: 201 });
  } catch (error) {
    console.error("Promo POST error:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
