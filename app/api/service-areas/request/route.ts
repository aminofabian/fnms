import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { areaRequestSchema } from "@/lib/validations/service-area";

// POST /api/service-areas/request - Request a new delivery area
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = areaRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { areaName, contactEmail } = parsed.data;

    await db.execute({
      sql: "INSERT INTO area_requests (area_name, contact_email) VALUES (?, ?)",
      args: [areaName, contactEmail],
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll notify you when we start delivering to your area.",
    });
  } catch (e) {
    console.error("Area request POST error:", e);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

// GET /api/service-areas/request - List area requests (admin)
export async function GET() {
  try {
    const { rows } = await db.execute({
      sql: "SELECT * FROM area_requests ORDER BY created_at DESC",
      args: [],
    });

    const requests = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        areaName: String(r.area_name),
        contactEmail: String(r.contact_email),
        status: String(r.status),
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      };
    });

    return NextResponse.json(requests);
  } catch (e) {
    console.error("Area requests GET error:", e);
    return NextResponse.json({ error: "Failed to fetch area requests" }, { status: 500 });
  }
}
