import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderConfirmation } from "@/lib/email";
import { sendOrderAlert, sendOrderReceivedSms } from "@/lib/sms";
import { getWalletBalance, deductForOrder } from "@/lib/wallet";

interface OrderItemInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
  priceCents: number;
}

interface DeliveryInput {
  serviceAreaId: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FN-${datePart}-${randomPart}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { delivery, paymentMethod, items } = body as {
      delivery: DeliveryInput;
      paymentMethod: "PAYSTACK" | "CASH_ON_DELIVERY" | "WALLET" | "TILL";
      items: OrderItemInput[];
    };

    // Validate items exist
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Validate delivery
    if (
      !delivery ||
      !delivery.serviceAreaId ||
      !delivery.recipientName ||
      !delivery.recipientPhone ||
      !delivery.deliveryAddress
    ) {
      return NextResponse.json({ error: "Missing delivery information" }, { status: 400 });
    }

    // Get service area for delivery fee
    const { rows: areaRows } = await db.execute({
      sql: "SELECT delivery_fee_cents, min_order_cents FROM service_areas WHERE id = ?",
      args: [delivery.serviceAreaId],
    });

    if (areaRows.length === 0) {
      return NextResponse.json({ error: "Invalid delivery area" }, { status: 400 });
    }

    const deliveryFeeCents = Number(areaRows[0].delivery_fee_cents) || 0;
    const minOrderCents = Number(areaRows[0].min_order_cents) || 0;

    // Validate stock and calculate subtotal
    let subtotalCents = 0;
    for (const item of items) {
      const { rows: productRows } = await db.execute({
        sql: "SELECT stock_quantity FROM products WHERE id = ?",
        args: [item.productId],
      });

      if (productRows.length === 0) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      const stockQty = Number(productRows[0].stock_quantity);
      if (stockQty < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        );
      }

      subtotalCents += item.priceCents * item.quantity;
    }

    // Check minimum order
    if (minOrderCents > 0 && subtotalCents < minOrderCents) {
      return NextResponse.json(
        { error: `Minimum order is KES ${(minOrderCents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    // Wallet: require logged-in user and sufficient balance
    if (paymentMethod === "WALLET") {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "You must be logged in to pay with wallet." },
          { status: 401 }
        );
      }
      const totalCentsForWallet = subtotalCents + deliveryFeeCents;
      const balanceCents = await getWalletBalance(session.user.id);
      if (balanceCents < totalCentsForWallet) {
        return NextResponse.json(
          {
            error:
              "Insufficient wallet balance. Top up or choose another payment method.",
          },
          { status: 400 }
        );
      }
    }

    // First order or guest: only M-Pesa (Paystack) or Till; cash on delivery allowed on subsequent orders only
    if (paymentMethod === "CASH_ON_DELIVERY") {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Cash on delivery is available from your second order. Please pay with M-Pesa or till for this order." },
          { status: 400 }
        );
      }
      const { rows: countRows } = await db.execute({
        sql: "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
        args: [session.user.id],
      });
      const orderCount = Number((countRows[0] as unknown as { count: number }).count ?? 0);
      if (orderCount === 0) {
        return NextResponse.json(
          { error: "Cash on delivery is available from your second order. Please pay with M-Pesa or till for your first order." },
          { status: 400 }
        );
      }
    }

    // TILL: available for all (including first order); payment processed manually
    if (paymentMethod === "TILL" && !session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to pay via till." },
        { status: 401 }
      );
    }

    const totalCents = subtotalCents + deliveryFeeCents;
    const orderNumber = generateOrderNumber();

    // Create order
    const { lastInsertRowid } = await db.execute({
      sql: `INSERT INTO orders (
        order_number, user_id, status, subtotal_cents, delivery_fee_cents, total_cents,
        service_area_id, recipient_name, recipient_phone, delivery_address, delivery_notes,
        payment_method, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderNumber,
        session?.user?.id ?? null,
        "pending",
        subtotalCents,
        deliveryFeeCents,
        totalCents,
        delivery.serviceAreaId,
        delivery.recipientName,
        delivery.recipientPhone,
        delivery.deliveryAddress,
        delivery.deliveryNotes ?? null,
        paymentMethod,
        paymentMethod === "WALLET"
          ? "paid"
          : paymentMethod === "CASH_ON_DELIVERY" || paymentMethod === "TILL"
            ? "pending"
            : "awaiting", // Paystack: awaiting until webhook confirms
      ],
    });

    const orderId = Number(lastInsertRowid);

    // Build item summaries for email and create order items + reduce stock
    const itemSummaries: { name: string; quantity: number; unitPriceCents: number }[] = [];

    for (const item of items) {
      const { rows: productRows } = await db.execute({
        sql: "SELECT name FROM products WHERE id = ?",
        args: [item.productId],
      });
      const productName = productRows.length > 0 ? String(productRows[0].name) : "Product";
      const totalCents = item.priceCents * item.quantity;
      itemSummaries.push({ name: productName, quantity: item.quantity, unitPriceCents: item.priceCents });

      await db.execute({
        sql: `INSERT INTO order_items (order_id, product_id, variant_id, name, quantity, price_cents, total_cents, unit_price_cents)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          item.productId,
          item.variantId ?? null,
          productName,
          item.quantity,
          item.priceCents,
          totalCents,
          item.priceCents,
        ],
      });

      await db.execute({
        sql: "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        args: [item.quantity, item.productId],
      });
    }

    // Wallet: deduct after order is created; rollback order on failure
    if (paymentMethod === "WALLET" && session?.user?.id) {
      const deductResult = await deductForOrder(
        session.user.id,
        orderId,
        totalCents,
        `Order ${orderNumber}`
      );
      if (!deductResult.ok) {
        for (const item of items) {
          await db.execute({
            sql: "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
            args: [item.quantity, item.productId],
          });
        }
        await db.execute({
          sql: "DELETE FROM orders WHERE id = ?",
          args: [orderId],
        });
        return NextResponse.json(
          { error: deductResult.error ?? "Wallet deduction failed" },
          { status: 400 }
        );
      }
    }

    // Send order confirmation email (non-blocking; don't fail the request if email fails)
    const recipientEmail = session?.user?.email;
    if (recipientEmail && typeof recipientEmail === "string") {
      sendOrderConfirmation(recipientEmail, {
        orderNumber,
        totalCents,
        items: itemSummaries,
        recipientName: delivery.recipientName,
        deliveryAddress: delivery.deliveryAddress,
        paymentMethod:
          paymentMethod === "PAYSTACK"
            ? "Paystack"
            : paymentMethod === "WALLET"
              ? "Wallet"
              : "Cash on delivery",
      }).then((r) => {
        if (!r.success) console.error("[Orders] Confirmation email failed:", r.error);
      });
    }

    // Notify admins via SMS (non-blocking)
    sendOrderAlert({
      orderNumber,
      totalCents,
      recipientName: delivery.recipientName,
    });

    // Notify logged-in user via SMS on their profile phone (non-blocking)
    if (session?.user?.id) {
      const { rows: userRows } = await db.execute({
        sql: "SELECT phone FROM users WHERE id = ? LIMIT 1",
        args: [session.user.id],
      });
      const userPhone = userRows[0] && userRows[0].phone != null ? String(userRows[0].phone) : null;
      if (userPhone) {
        sendOrderReceivedSms(orderNumber, userPhone);
      }
    }

    // Clear user's cart if logged in
    if (session?.user?.id) {
      await db.execute({
        sql: "DELETE FROM cart_items WHERE user_id = ?",
        args: [session.user.id],
      });
    }

    return NextResponse.json({ orderNumber, orderId });
  } catch (e) {
    console.error("Order POST error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      // Single order
      const { rows } = await db.execute({
        sql: `SELECT * FROM orders WHERE order_number = ? AND user_id = ?`,
        args: [orderNumber, session.user.id],
      });

      if (rows.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const { rows: itemRows } = await db.execute({
        sql: `SELECT oi.*, p.name as product_name, p.slug as product_slug
              FROM order_items oi
              JOIN products p ON p.id = oi.product_id
              WHERE oi.order_id = ?`,
        args: [rows[0].id],
      });

      return NextResponse.json({ order: rows[0], items: itemRows });
    }

    // All orders for user
    const { rows } = await db.execute({
      sql: "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      args: [session.user.id],
    });

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Order GET error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
