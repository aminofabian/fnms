import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Returns the number of orders for the current user. Used to determine first vs subsequent order (payment rules). */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await db.execute({
      sql: "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
      args: [session.user.id],
    });

    const count = Number((rows[0] as { count: number }).count ?? 0);
    return NextResponse.json({ count });
  } catch (e) {
    console.error("Order count error:", e);
    return NextResponse.json({ error: "Failed to get order count" }, { status: 500 });
  }
}
