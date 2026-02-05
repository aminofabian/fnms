import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toUpperCase() !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const areaId = searchParams.get("areaId");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT o.*, sa.name as area_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN service_areas sa ON sa.id = o.service_area_id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (status) {
      sql += " AND o.status = ?";
      args.push(status);
    }

    if (areaId) {
      sql += " AND o.service_area_id = ?";
      args.push(Number(areaId));
    }

    if (search) {
      sql += " AND (o.order_number LIKE ? OR o.recipient_name LIKE ? OR o.recipient_phone LIKE ?)";
      const searchTerm = `%${search}%`;
      args.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countSql = sql.replace(/SELECT.*?FROM/, "SELECT COUNT(*) as count FROM");
    const { rows: countRows } = await db.execute({ sql: countSql, args });
    const total = Number((countRows[0] as unknown as { count: number }).count);

    // Get paginated orders
    sql += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const { rows } = await db.execute({ sql, args });

    return NextResponse.json({
      orders: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("Admin orders GET error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
