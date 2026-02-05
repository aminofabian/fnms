import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"), // e.g., "Home", "Office"
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Phone must be at least 10 digits"),
  serviceAreaId: z.number().int().positive("Service area is required"),
  addressLine: z.string().min(5, "Address is required"),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// GET /api/user/addresses - Get user's addresses
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Get addresses with service area info
    const { rows } = await db.execute({
      sql: `SELECT a.*, sa.name as service_area_name
            FROM addresses a
            LEFT JOIN service_areas sa ON a.service_area_id = sa.id
            WHERE a.user_id = ?
            ORDER BY a.is_default DESC, a.created_at DESC`,
      args: [userId],
    });

    const addresses = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        label: String(r.label),
        recipientName: String(r.recipient_name),
        recipientPhone: String(r.recipient_phone),
        serviceAreaId: Number(r.service_area_id),
        serviceAreaName: r.service_area_name ? String(r.service_area_name) : null,
        addressLine: String(r.address_line),
        notes: r.notes ? String(r.notes) : null,
        isDefault: Boolean(r.is_default),
        createdAt: String(r.created_at),
      };
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create new address
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);
    const { label, recipientName, recipientPhone, serviceAreaId, addressLine, notes, isDefault } = parsed.data;

    // If this is default, unset other defaults
    if (isDefault) {
      await db.execute({
        sql: "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        args: [userId],
      });
    }

    // Insert address
    await db.execute({
      sql: `INSERT INTO addresses (user_id, label, recipient_name, recipient_phone, service_area_id, address_line, notes, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, label, recipientName, recipientPhone, serviceAreaId, addressLine, notes || null, isDefault ? 1 : 0],
    });

    // Fetch created address
    const { rows } = await db.execute({
      sql: `SELECT a.*, sa.name as service_area_name
            FROM addresses a
            LEFT JOIN service_areas sa ON a.service_area_id = sa.id
            WHERE a.user_id = ?
            ORDER BY a.id DESC LIMIT 1`,
      args: [userId],
    });

    const r = rows[0] as Record<string, unknown>;
    const address = {
      id: Number(r.id),
      label: String(r.label),
      recipientName: String(r.recipient_name),
      recipientPhone: String(r.recipient_phone),
      serviceAreaId: Number(r.service_area_id),
      serviceAreaName: r.service_area_name ? String(r.service_area_name) : null,
      addressLine: String(r.address_line),
      notes: r.notes ? String(r.notes) : null,
      isDefault: Boolean(r.is_default),
      createdAt: String(r.created_at),
    };

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
