import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const INITIATE_URL =
  process.env.PAYSTACK_INITIATE_URL ?? "https://api.paystack.co/transaction/initialize";

const MIN_CENTS = 100_00; // 100 KES
const MAX_CENTS = 500_000_00; // 50,000 KES

function generateTopUpReference(): string {
  return "wtu-" + randomBytes(8).toString("hex");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!SECRET_KEY) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const amountCents = Number((body as { amountCents?: number }).amountCents);

    if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
      return NextResponse.json(
        {
          error: `Amount must be between KES ${(MIN_CENTS / 100).toLocaleString()} and KES ${(MAX_CENTS / 100).toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    const reference = generateTopUpReference();
    const userId = session.user.id;
    const email = session.user.email;

    await db.execute({
      sql: `INSERT INTO wallet_top_ups (user_id, amount_cents, status, paystack_reference)
            VALUES (?, ?, 'pending', ?)`,
      args: [userId, amountCents, reference],
    });

    const baseUrl = process.env.PAYSTACK_SUCCESS_URL ?? process.env.NEXTAUTH_URL ?? "";
    const callbackUrl = `${baseUrl.replace(/\/$/, "")}/account/wallet/success?reference=${encodeURIComponent(reference)}`;

    const res = await fetch(INITIATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountCents,
        reference,
        callback_url: callbackUrl,
        currency: "KES",
        metadata: { type: "wallet_top_up", user_id: userId },
      }),
    });

    const data = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; reference: string };
    };

    if (!res.ok || !data.status || !data.data?.authorization_url) {
      console.error("[Paystack] Wallet top-up initialize failed:", data);
      await db.execute({
        sql: "UPDATE wallet_top_ups SET status = 'failed', updated_at = datetime('now') WHERE paystack_reference = ?",
        args: [reference],
      });
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? "Failed to start payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (e) {
    console.error("[Wallet top-up] Error:", e);
    return NextResponse.json(
      { error: "Failed to start top-up" },
      { status: 500 }
    );
  }
}
