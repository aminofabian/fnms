import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHmac } from "crypto";

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const VERIFY_URL = process.env.PAYSTACK_VERIFY_URL ?? "https://api.paystack.co/transaction/verify/";

function verifyPaystackSignature(payload: string, signature: string | null): boolean {
  if (!SECRET_KEY || !signature) return false;
  const hash = createHmac("sha512", SECRET_KEY).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(request: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.warn("[Paystack Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data?: { reference?: string; status?: string; amount?: number } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Acknowledge immediately; process async if needed
  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      // Verify with Paystack and then update order (idempotent)
      try {
        const verifyRes = await fetch(`${VERIFY_URL}${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${SECRET_KEY}` },
        });
        const verifyData = (await verifyRes.json()) as {
          status?: boolean;
          data?: { status: string; amount: number; reference: string };
        };
        if (
          verifyData.status &&
          verifyData.data?.status === "success" &&
          verifyData.data?.reference === reference
        ) {
          const { rows } = await db.execute({
            sql: "SELECT id, total_cents, payment_status FROM orders WHERE order_number = ?",
            args: [reference],
          });
          if (rows.length > 0) {
            const order = rows[0] as unknown as {
              id: number;
              total_cents: number;
              payment_status: string;
            };
            const expectedAmount = Number(order.total_cents);
            const paidAmount = verifyData.data!.amount;
            // Paystack may return amount in kobo/cents; ensure it matches
            if (paidAmount === expectedAmount || paidAmount === expectedAmount * 100) {
              await db.execute({
                sql: "UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE order_number = ?",
                args: ["paid", reference],
              });
            }
          }
        }
      } catch (e) {
        console.error("[Paystack Webhook] Verify/update error:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
