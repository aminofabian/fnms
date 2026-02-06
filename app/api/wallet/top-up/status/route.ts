import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/wallet/top-up/status?reference=wtu-xxx
 * Returns the top-up record for the current user (to show amount on success page).
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  if (!reference?.trim()) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const { rows } = await db.execute({
    sql: "SELECT amount_cents, status FROM wallet_top_ups WHERE paystack_reference = ? AND user_id = ? LIMIT 1",
    args: [reference.trim(), session.user.id],
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Top-up not found" }, { status: 404 });
  }

  const row = rows[0] as unknown as { amount_cents: number; status: string };
  return NextResponse.json({
    amountCents: Number(row.amount_cents),
    status: row.status,
  });
}
