import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toUpperCase() !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { rows } = await db.execute({
      sql: `SELECT o.*, sa.name as area_name, u.name as user_name, u.email as user_email
            FROM orders o
            LEFT JOIN service_areas sa ON sa.id = o.service_area_id
            LEFT JOIN users u ON u.id = o.user_id
            WHERE o.id = ?`,
      args: [id],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { rows: itemRows } = await db.execute({
      sql: `SELECT oi.*, p.name as product_name, p.slug as product_slug,
                   (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?`,
      args: [id],
    });

    return NextResponse.json({
      order: rows[0],
      items: itemRows,
    });
  } catch (e) {
    console.error("Admin order GET error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
