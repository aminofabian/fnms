import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHmac } from "crypto";
import { recordTransaction } from "@/lib/wallet";

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
          const paidAmount = verifyData.data.amount; // Paystack KES: amount in cents

          const { rows: orderRows } = await db.execute({
            sql: "SELECT id, total_cents, payment_status FROM orders WHERE order_number = ?",
            args: [reference],
          });
          if (orderRows.length > 0) {
            const order = orderRows[0] as unknown as {
              id: number;
              total_cents: number;
              payment_status: string;
            };
            const expectedAmount = Number(order.total_cents);
            if (paidAmount === expectedAmount) {
              await db.execute({
                sql: "UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE order_number = ?",
                args: ["paid", reference],
              });
            }
          } else {
            const { rows: topUpRows } = await db.execute({
              sql: "SELECT id, user_id, amount_cents, status FROM wallet_top_ups WHERE paystack_reference = ?",
              args: [reference],
            });
            if (topUpRows.length > 0) {
              const topUp = topUpRows[0] as unknown as {
                id: number;
                user_id: number;
                amount_cents: number;
                status: string;
              };
              if (topUp.status === "pending") {
                const expectedCents = Number(topUp.amount_cents);
                if (paidAmount === expectedCents) {
                  await recordTransaction(String(topUp.user_id), {
                    type: "top_up",
                    amountCents: expectedCents,
                    referenceType: "paystack",
                    referenceId: reference,
                    description: "Wallet top-up",
                  });
                  await db.execute({
                    sql: "UPDATE wallet_top_ups SET status = 'completed', updated_at = datetime('now') WHERE paystack_reference = ?",
                    args: [reference],
                  });
                }
              }
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
