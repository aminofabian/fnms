import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Ensure users.blocked exists (run migration 005 if needed). */
async function ensureBlockedColumn(): Promise<void> {
  try {
    await db.execute({
      sql: "ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0",
      args: [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes("duplicate column name")) throw e;
  }
  try {
    await db.execute({
      sql: "CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(blocked)",
      args: [],
    });
  } catch {
    // index may already exist
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role"); // customer | admin
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT u.id, u.email, u.name, u.phone, u.role, u.created_at,
             COALESCE(u.wallet_balance_cents, 0) as wallet_balance_cents,
             COALESCE(u.blocked, 0) as blocked,
             (SELECT COUNT(*) FROM orders WHERE orders.user_id = u.id) as order_count
      FROM users u
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (roleFilter === "customer" || roleFilter === "admin") {
      sql += " AND u.role = ?";
      args.push(roleFilter);
    }

    if (search) {
      sql += " AND (u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
      const term = `%${search}%`;
      args.push(term, term, term);
    }

    let countSql = "SELECT COUNT(*) as count FROM users u WHERE 1=1";
    const countArgs: (string | number)[] = [];
    if (roleFilter === "customer" || roleFilter === "admin") {
      countSql += " AND u.role = ?";
      countArgs.push(roleFilter);
    }
    if (search) {
      countSql += " AND (u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
      const term = `%${search}%`;
      countArgs.push(term, term, term);
    }
    const { rows: countRows } = await db.execute({ sql: countSql, args: countArgs });
    const total = Number((countRows[0] as unknown as { count: number })?.count ?? 0);

    sql += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    let rows: Record<string, unknown>[];
    try {
      const result = await db.execute({ sql, args });
      rows = result.rows as Record<string, unknown>[];
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("no such column") || !msg.includes("blocked")) throw e;
      await ensureBlockedColumn();
      const result = await db.execute({ sql, args });
      rows = result.rows as Record<string, unknown>[];
    }

    return NextResponse.json({
      users: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("Admin users GET error:", e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
