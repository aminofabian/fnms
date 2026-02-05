import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceAreaSchema } from "@/lib/validations/service-area";
import type { ServiceArea } from "@/types/service-area";

function rowToServiceArea(row: Record<string, unknown>): ServiceArea {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    deliveryFeeCents: row.delivery_fee_cents != null ? Number(row.delivery_fee_cents) : 0,
    minOrderCents: row.min_order_cents != null ? Number(row.min_order_cents) : 0,
    estimatedTime: row.estimated_time ? String(row.estimated_time) : null,
    isActive: row.is_active != null ? Boolean(row.is_active) : true,
    createdAt: String(row.created_at),
    updatedAt: row.updated_at != null ? String(row.updated_at) : String(row.created_at),
  };
}

// GET /api/service-areas - List service areas (works with or without is_active column)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const { rows } = await db.execute({
      sql: "SELECT * FROM service_areas ORDER BY name",
      args: [],
    });

    const areas = rows
      .map((row) => rowToServiceArea(row as Record<string, unknown>))
      .filter((area) => includeInactive || area.isActive);
    return NextResponse.json(areas);
  } catch (e) {
    console.error("Service areas GET error:", e);
    return NextResponse.json({ error: "Failed to fetch service areas" }, { status: 500 });
  }
}

// POST /api/service-areas - Create new service area (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = serviceAreaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { slug, name, deliveryFeeCents, minOrderCents, estimatedTime, isActive } = parsed.data;

    // Check for duplicate slug
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: "A service area with this slug already exists" }, { status: 409 });
    }

    await db.execute({
      sql: `INSERT INTO service_areas (slug, name, delivery_fee_cents, min_order_cents, estimated_time, is_active)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [slug, name, deliveryFeeCents ?? 0, minOrderCents ?? 0, estimatedTime ?? null, isActive ? 1 : 0],
    });

    // Fetch the created area
    const { rows } = await db.execute({
      sql: "SELECT * FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    return NextResponse.json(rowToServiceArea(rows[0] as Record<string, unknown>), { status: 201 });
  } catch (e) {
    console.error("Service areas POST error:", e);
    return NextResponse.json({ error: "Failed to create service area" }, { status: 500 });
  }
}
