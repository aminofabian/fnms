import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/service-areas/check?slug=mirema
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: "SELECT id, name, is_active FROM service_areas WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (rows.length === 0) {
      return NextResponse.json({ supported: false, message: "This area is not yet available for delivery" });
    }

    const row = rows[0] as Record<string, unknown>;
    const isActive = Boolean(row.is_active);

    return NextResponse.json({
      supported: isActive,
      name: String(row.name),
      message: isActive
        ? `We deliver to ${row.name}!`
        : `Delivery to ${row.name} is currently paused`,
    });
  } catch (e) {
    console.error("Service area check error:", e);
    return NextResponse.json({ error: "Failed to check service area" }, { status: 500 });
  }
}
