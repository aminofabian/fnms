import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceAreaSchema } from "@/lib/validations/service-area";
import type { ServiceArea } from "@/types/service-area";

function rowToServiceArea(row: Record<string, unknown>): ServiceArea {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    deliveryFeeCents: Number(row.delivery_fee_cents),
    minOrderCents: Number(row.min_order_cents),
    estimatedTime: row.estimated_time ? String(row.estimated_time) : null,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// GET /api/service-areas/[slug]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { rows } = await db.execute({
      sql: "SELECT * FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Service area not found" }, { status: 404 });
    }

    return NextResponse.json(rowToServiceArea(rows[0] as Record<string, unknown>));
  } catch (e) {
    console.error("Service area GET error:", e);
    return NextResponse.json({ error: "Failed to fetch service area" }, { status: 500 });
  }
}

// PUT /api/service-areas/[slug]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = serviceAreaSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if area exists
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service area not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (parsed.data.name !== undefined) {
      updates.push("name = ?");
      args.push(parsed.data.name);
    }
    if (parsed.data.slug !== undefined) {
      updates.push("slug = ?");
      args.push(parsed.data.slug);
    }
    if (parsed.data.deliveryFeeCents !== undefined) {
      updates.push("delivery_fee_cents = ?");
      args.push(parsed.data.deliveryFeeCents);
    }
    if (parsed.data.minOrderCents !== undefined) {
      updates.push("min_order_cents = ?");
      args.push(parsed.data.minOrderCents);
    }
    if (parsed.data.estimatedTime !== undefined) {
      updates.push("estimated_time = ?");
      args.push(parsed.data.estimatedTime);
    }
    if (parsed.data.isActive !== undefined) {
      updates.push("is_active = ?");
      args.push(parsed.data.isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(slug);

    await db.execute({
      sql: `UPDATE service_areas SET ${updates.join(", ")} WHERE slug = ?`,
      args,
    });

    const newSlug = parsed.data.slug ?? slug;
    const { rows } = await db.execute({
      sql: "SELECT * FROM service_areas WHERE slug = ? LIMIT 1",
      args: [newSlug],
    });

    return NextResponse.json(rowToServiceArea(rows[0] as Record<string, unknown>));
  } catch (e) {
    console.error("Service area PUT error:", e);
    return NextResponse.json({ error: "Failed to update service area" }, { status: 500 });
  }
}

// DELETE /api/service-areas/[slug]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { rows } = await db.execute({
      sql: "SELECT id FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Service area not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM service_areas WHERE slug = ?",
      args: [slug],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Service area DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete service area" }, { status: 500 });
  }
}
