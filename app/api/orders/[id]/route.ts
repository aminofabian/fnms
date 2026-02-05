import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Order, OrderItem } from "@/types/order";

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: Number(row.id),
    orderNumber: String(row.order_number),
    userId: row.user_id ? Number(row.user_id) : null,
    status: (String(row.status).toUpperCase()) as Order["status"],
    subtotalCents: Number(row.subtotal_cents) || 0,
    deliveryFeeCents: Number(row.delivery_fee_cents) || 0,
    discountCents: Number(row.discount_cents) || 0,
    totalCents: Number(row.total_cents) || 0,
    serviceAreaId: Number(row.service_area_id),
    serviceAreaName: row.area_name ? String(row.area_name) : undefined,
    recipientName: String(row.recipient_name),
    recipientPhone: String(row.recipient_phone),
    deliveryAddress: String(row.delivery_address),
    deliveryNotes: row.delivery_notes ? String(row.delivery_notes) : null,
    paymentMethod: String(row.payment_method) as Order["paymentMethod"],
    paymentStatus: (String(row.payment_status).toUpperCase()) as Order["paymentStatus"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: Number(row.id),
    orderId: Number(row.order_id),
    productId: Number(row.product_id),
    variantId: row.variant_id ? Number(row.variant_id) : null,
    quantity: Number(row.quantity),
    unitPriceCents: Number(row.unit_price_cents ?? row.price_cents ?? 0),
    productName: row.product_name ? String(row.product_name) : undefined,
    productSlug: row.product_slug ? String(row.product_slug) : undefined,
    productImageUrl: row.image_url ? String(row.image_url) : null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get order with service area name
    const { rows } = await db.execute({
      sql: `SELECT o.*, sa.name as area_name
            FROM orders o
            LEFT JOIN service_areas sa ON sa.id = o.service_area_id
            WHERE o.id = ? AND o.user_id = ?`,
      args: [id, session.user.id],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rowToOrder(rows[0] as Record<string, unknown>);

    // Get order items with product details
    const { rows: itemRows } = await db.execute({
      sql: `SELECT oi.*, p.name as product_name, p.slug as product_slug,
                   (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?`,
      args: [id],
    });

    order.items = itemRows.map((r) => rowToOrderItem(r as Record<string, unknown>));

    return NextResponse.json(order);
  } catch (e) {
    console.error("Order GET error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
