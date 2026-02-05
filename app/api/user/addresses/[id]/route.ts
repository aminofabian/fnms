import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1).optional(),
  recipientName: z.string().min(2).optional(),
  recipientPhone: z.string().min(10).optional(),
  serviceAreaId: z.number().int().positive().optional(),
  addressLine: z.string().min(5).optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// PUT /api/user/addresses/[id] - Update address
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    // Check address belongs to user
    const { rows: addressRows } = await db.execute({
      sql: "SELECT id FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
      args: [parseInt(id), userId],
    });

    if (addressRows.length === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (parsed.data.label !== undefined) {
      updates.push("label = ?");
      args.push(parsed.data.label);
    }
    if (parsed.data.recipientName !== undefined) {
      updates.push("recipient_name = ?");
      args.push(parsed.data.recipientName);
    }
    if (parsed.data.recipientPhone !== undefined) {
      updates.push("recipient_phone = ?");
      args.push(parsed.data.recipientPhone);
    }
    if (parsed.data.serviceAreaId !== undefined) {
      updates.push("service_area_id = ?");
      args.push(parsed.data.serviceAreaId);
    }
    if (parsed.data.addressLine !== undefined) {
      updates.push("address_line = ?");
      args.push(parsed.data.addressLine);
    }
    if (parsed.data.notes !== undefined) {
      updates.push("notes = ?");
      args.push(parsed.data.notes || null);
    }
    if (parsed.data.isDefault !== undefined) {
      // If setting as default, unset others first
      if (parsed.data.isDefault) {
        await db.execute({
          sql: "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
          args: [userId],
        });
      }
      updates.push("is_default = ?");
      args.push(parsed.data.isDefault ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(parseInt(id));

    await db.execute({
      sql: `UPDATE addresses SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses/[id] - Delete address
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Check address belongs to user
    const { rows: addressRows } = await db.execute({
      sql: "SELECT id FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
      args: [parseInt(id), userId],
    });

    if (addressRows.length === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM addresses WHERE id = ?",
      args: [parseInt(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
