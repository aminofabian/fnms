import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordTransaction } from "@/lib/wallet";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = id;
    const body = await request.json();

    const walletAdjustmentCents = body.walletAdjustmentCents != null ? Number(body.walletAdjustmentCents) : null;
    const walletDescription = typeof body.walletDescription === "string" ? body.walletDescription : undefined;
    const blocked = body.blocked;
    const newRole = body.role;

    if (walletAdjustmentCents !== null && walletAdjustmentCents !== 0) {
      const description = walletDescription || (walletAdjustmentCents > 0 ? "Admin credit" : "Admin debit");
      try {
        await recordTransaction(userId, {
          type: "adjustment",
          amountCents: walletAdjustmentCents,
          description,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Wallet update failed";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (typeof blocked === "boolean") {
      updates.push("blocked = ?");
      args.push(blocked ? 1 : 0);
    }

    if (newRole === "customer" || newRole === "admin") {
      updates.push("role = ?");
      args.push(newRole);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      args.push(userId);
      await db.execute({
        sql: `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        args,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin users PATCH error:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
