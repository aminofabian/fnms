import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const INITIATE_URL = process.env.PAYSTACK_INITIATE_URL ?? "https://api.paystack.co/transaction/initialize";

export async function POST(request: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { orderId, orderNumber, email } = body as { orderId: number; orderNumber: string; email: string };

    if (!orderId || !orderNumber || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid orderId, orderNumber, and email are required" }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: "SELECT id, order_number, total_cents, payment_method, payment_status FROM orders WHERE id = ? AND order_number = ?",
      args: [orderId, orderNumber],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0] as unknown as { id: number; order_number: string; total_cents: number; payment_method: string; payment_status: string };
    if (order.payment_method !== "PAYSTACK") {
      return NextResponse.json({ error: "Order is not a Paystack order" }, { status: 400 });
    }
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const amountCents = Number(order.total_cents);
    const baseUrl = process.env.PAYSTACK_SUCCESS_URL ?? process.env.NEXTAUTH_URL ?? "https://fnms.co.ke";
    const callbackUrl = `${baseUrl.replace(/\/$/, "")}/checkout/success?order=${encodeURIComponent(orderNumber)}`;

    const res = await fetch(INITIATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountCents, // Paystack KES uses cents (smallest unit)
        reference: orderNumber,
        callback_url: callbackUrl,
        currency: "KES",
        metadata: { order_id: String(order.id), order_number: orderNumber },
      }),
    });

    const data = (await res.json()) as { status?: boolean; message?: string; data?: { authorization_url: string; reference: string } };
    if (!res.ok || !data.status || !data.data?.authorization_url) {
      console.error("[Paystack] Initialize failed:", data);
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? "Failed to initialize payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (e) {
    console.error("[Paystack] Initialize error:", e);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
