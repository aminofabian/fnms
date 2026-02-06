import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public endpoint: get order summary by order number (for checkout success page).
 * Returns only summary data—no address or phone.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: `SELECT id, order_number, total_cents, payment_method, created_at
            FROM orders
            WHERE order_number = ?`,
      args: [orderNumber],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0] as Record<string, unknown>;
    const orderId = Number(order.id);

    const { rows: itemRows } = await db.execute({
      sql: `SELECT name, quantity, unit_price_cents, price_cents
            FROM order_items
            WHERE order_id = ?
            ORDER BY id`,
      args: [orderId],
    });

    const items = itemRows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        name: String(row.name ?? "Item"),
        quantity: Number(row.quantity) || 0,
        unitPriceCents: Number(row.unit_price_cents ?? row.price_cents ?? 0),
      };
    });

    const createdAt = String(order.created_at);
    const created = new Date(createdAt);
    const now = new Date();
    const isToday = created.toDateString() === now.toDateString();
    const hour = created.getHours();
    // Same day if before 2 PM; otherwise next day
    const estimatedDelivery =
      isToday && hour < 14
        ? "Today (by end of day)"
        : "Within 24–48 hours";

    return NextResponse.json({
      orderNumber: String(order.order_number),
      totalCents: Number(order.total_cents) || 0,
      paymentMethod: order.payment_method ? String(order.payment_method) : null,
      createdAt,
      estimatedDelivery,
      items,
    });
  } catch (e) {
    console.error("Order by-number GET error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
