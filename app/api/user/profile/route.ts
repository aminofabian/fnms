import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
});

// GET /api/user/profile - Get current user profile
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await db.execute({
      sql: "SELECT id, name, email, phone, role, created_at FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0] as Record<string, unknown>;

    return NextResponse.json({
      id: Number(user.id),
      name: user.name ? String(user.name) : null,
      email: String(user.email),
      phone: user.phone ? String(user.phone) : null,
      role: String(user.role || "customer"),
      createdAt: String(user.created_at),
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update current user profile
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (parsed.data.name !== undefined) {
      updates.push("name = ?");
      args.push(parsed.data.name);
    }

    if (parsed.data.phone !== undefined) {
      updates.push("phone = ?");
      args.push(parsed.data.phone);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(session.user.email);

    await db.execute({
      sql: `UPDATE users SET ${updates.join(", ")} WHERE email = ?`,
      args,
    });

    // Fetch updated user
    const { rows } = await db.execute({
      sql: "SELECT id, name, email, phone, role, created_at FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    const user = rows[0] as Record<string, unknown>;

    return NextResponse.json({
      id: Number(user.id),
      name: user.name ? String(user.name) : null,
      email: String(user.email),
      phone: user.phone ? String(user.phone) : null,
      role: String(user.role || "customer"),
      createdAt: String(user.created_at),
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
