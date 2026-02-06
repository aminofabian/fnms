import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/wishlist/count - Get wishlist item count for the current user
export async function GET() {
  const session = await getServerSession(authOptions);

  // For unauthenticated users, treat count as 0 so the header UI can still call this safely
  if (!session?.user?.email) {
    return NextResponse.json({ count: 0 });
  }

  try {
    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const userId = Number(userRows[0].id);

    // Get wishlist count
    const { rows } = await db.execute({
      sql: "SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?",
      args: [userId],
    });

    const row = rows[0] as Record<string, unknown>;
    const rawCount = row?.count;
    const count = typeof rawCount === "number" ? rawCount : Number(rawCount ?? 0);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Wishlist count error:", error);
    // Fail soft with count 0 so header doesn't break
    return NextResponse.json({ count: 0 });
  }
}

