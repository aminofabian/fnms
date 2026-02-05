import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { Review } from "@/types/review";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  body: z.string().max(2000).optional(),
});

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    productId: Number(row.product_id),
    rating: Number(row.rating),
    body: row.body ? String(row.body) : null,
    isApproved: Boolean(row.is_approved),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// PUT /api/reviews/[id] - Update own review
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
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get user id
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Check review exists and belongs to user
    const { rows: reviewRows } = await db.execute({
      sql: "SELECT * FROM reviews WHERE id = ? AND user_id = ? LIMIT 1",
      args: [parseInt(id), userId],
    });

    if (reviewRows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (parsed.data.rating !== undefined) {
      updates.push("rating = ?");
      args.push(parsed.data.rating);
    }
    if (parsed.data.body !== undefined) {
      updates.push("body = ?");
      args.push(parsed.data.body ?? null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(parseInt(id));

    await db.execute({
      sql: `UPDATE reviews SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM reviews WHERE id = ? LIMIT 1",
      args: [parseInt(id)],
    });

    return NextResponse.json(rowToReview(rows[0] as Record<string, unknown>));
  } catch (error) {
    console.error("Review PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete own review
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

    // Get user id
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM reviews WHERE id = ? AND user_id = ? LIMIT 1",
      args: [parseInt(id), userId],
    });

    if (existing.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM reviews WHERE id = ?",
      args: [parseInt(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
