import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/inventory - List all products with stock info
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "low-stock" or "out-of-stock"
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");

    let sql = `
      SELECT p.id, p.name, p.slug, p.stock_quantity, p.is_active,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (search) {
      sql += " AND p.name LIKE ?";
      args.push(`%${search}%`);
    }

    if (categoryId) {
      sql += " AND p.category_id = ?";
      args.push(parseInt(categoryId));
    }

    if (filter === "low-stock") {
      sql += " AND p.stock_quantity > 0 AND p.stock_quantity <= 10";
    } else if (filter === "out-of-stock") {
      sql += " AND p.stock_quantity = 0";
    }

    sql += " ORDER BY p.stock_quantity ASC, p.name ASC";

    const { rows } = await db.execute({ sql, args });

    const products = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        name: String(r.name),
        slug: String(r.slug),
        stockQuantity: Number(r.stock_quantity),
        isActive: Boolean(r.is_active),
        categoryName: r.category_name ? String(r.category_name) : null,
      };
    });

    // Get summary stats
    const { rows: statsRows } = await db.execute({
      sql: `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
              SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock
            FROM products`,
      args: [],
    });

    const stats = {
      total: Number(statsRows[0]?.total) || 0,
      outOfStock: Number(statsRows[0]?.out_of_stock) || 0,
      lowStock: Number(statsRows[0]?.low_stock) || 0,
    };

    return NextResponse.json({ products, stats });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
