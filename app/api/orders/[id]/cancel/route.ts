import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { refundForOrder } from "@/lib/wallet";

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

    // Refund wallet if order was paid with WALLET
    const paymentMethod = String(order.payment_method || "").toLowerCase();
    const paymentStatus = String(order.payment_status || "").toLowerCase();
    const userId = order.user_id;
    if (
      paymentMethod === "wallet" &&
      paymentStatus === "paid" &&
      userId != null
    ) {
      const refundResult = await refundForOrder(
        String(userId),
        Number(id),
        Number(order.total_cents),
        order.order_number ? String(order.order_number) : undefined
      );
      if (!refundResult.ok) {
        console.error("Wallet refund failed on cancel:", refundResult.error);
        // Don't fail the cancel - order is cancelled and stock restored; log for manual follow-up
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Order cancel error:", e);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
