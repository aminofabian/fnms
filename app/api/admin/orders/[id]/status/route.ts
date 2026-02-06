import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { refundForOrder } from "@/lib/wallet";
import type { OrderStatus } from "@/types/order";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function PUT(
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
    const body = await request.json();
    const { status, notes } = body as { status: OrderStatus; notes?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current order
    const { rows } = await db.execute({
      sql: "SELECT * FROM orders WHERE id = ?",
      args: [id],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = String(rows[0].status);

    const order = rows[0];

    // If cancelling, restore stock and refund wallet if paid with WALLET
    if (status === "CANCELLED" && currentStatus !== "cancelled") {
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
          console.error("Wallet refund failed on admin cancel:", refundResult.error);
        }
      }
    }

    // Update order status (DB uses lowercase to match schema CHECK)
    await db.execute({
      sql: `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [status.toLowerCase(), id],
    });

    // Log status change (optional: could add to a status_history table)
    console.log(`Order ${id} status changed from ${currentStatus} to ${status}`, notes ? `Notes: ${notes}` : "");

    return NextResponse.json({ success: true, status });
  } catch (e) {
    console.error("Admin order status PUT error:", e);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
