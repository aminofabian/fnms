import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { PromoCode } from "@/types/promo";

const promoSchema = z.object({
  code: z.string().min(3).max(20).transform((v) => v.toUpperCase()).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderCents: z.number().min(0).optional(),
  maxUsageCount: z.number().int().positive().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
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

// GET /api/admin/promo/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { rows } = await db.execute({
      sql: "SELECT * FROM promo_codes WHERE id = ? LIMIT 1",
      args: [parseInt(id)],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    return NextResponse.json(rowToPromo(rows[0] as Record<string, unknown>));
  } catch (error) {
    console.error("Promo GET error:", error);
    return NextResponse.json({ error: "Failed to fetch promo code" }, { status: 500 });
  }
}

// PUT /api/admin/promo/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = promoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if exists
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM promo_codes WHERE id = ? LIMIT 1",
      args: [parseInt(id)],
    });

    if (existing.length === 0) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];
    const data = parsed.data;

    if (data.code !== undefined) {
      updates.push("code = ?");
      args.push(data.code);
    }
    if (data.discountType !== undefined) {
      updates.push("discount_type = ?");
      args.push(data.discountType);
    }
    if (data.discountValue !== undefined) {
      updates.push("discount_value = ?");
      args.push(data.discountValue);
    }
    if (data.minOrderCents !== undefined) {
      updates.push("min_order_cents = ?");
      args.push(data.minOrderCents);
    }
    if (data.maxUsageCount !== undefined) {
      updates.push("max_usage_count = ?");
      args.push(data.maxUsageCount);
    }
    if (data.startsAt !== undefined) {
      updates.push("starts_at = ?");
      args.push(data.startsAt);
    }
    if (data.expiresAt !== undefined) {
      updates.push("expires_at = ?");
      args.push(data.expiresAt);
    }
    if (data.isActive !== undefined) {
      updates.push("is_active = ?");
      args.push(data.isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(parseInt(id));

    await db.execute({
      sql: `UPDATE promo_codes SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    // Fetch updated
    const { rows } = await db.execute({
      sql: "SELECT * FROM promo_codes WHERE id = ? LIMIT 1",
      args: [parseInt(id)],
    });

    return NextResponse.json(rowToPromo(rows[0] as Record<string, unknown>));
  } catch (error) {
    console.error("Promo PUT error:", error);
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

// DELETE /api/admin/promo/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await db.execute({
      sql: "DELETE FROM promo_codes WHERE id = ?",
      args: [parseInt(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Promo DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
