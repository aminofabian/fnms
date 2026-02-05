import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get order
    const { rows } = await db.execute({
      sql: "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      args: [id, session.user.id],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];
    const status = String(order.status);

    // Only allow cancellation of pending or confirmed orders
    if (status !== "pending" && status !== "confirmed") {
      return NextResponse.json(
        { error: "Cannot cancel order in current status" },
        { status: 400 }
      );
    }

    // Update order status
    await db.execute({
      sql: "UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?",
      args: [id],
    });

    // Restore stock
    const { rows: items } = await db.execute({
      sql: "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      args: [id],
    });

    for (const item of items) {
      await db.execute({
        sql: "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        args: [item.quantity, item.product_id],
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Order cancel error:", e);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
