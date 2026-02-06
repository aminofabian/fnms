import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const offset = (page - 1) * limit;
    const userId = session.user.id;

    const { rows } = await db.execute({
      sql: `SELECT id, type, amount_cents, reference_type, reference_id, balance_after_cents, description, created_at
            FROM wallet_transactions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
      args: [userId, limit, offset],
    });

    const transactions = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        type: r.type,
        amountCents: Number(r.amount_cents),
        referenceType: r.reference_type ?? null,
        referenceId: r.reference_id ?? null,
        balanceAfterCents: Number(r.balance_after_cents),
        description: r.description ?? null,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Wallet transactions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
