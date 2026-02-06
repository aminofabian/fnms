import { db } from "@/lib/db";

export type WalletTransactionType =
  | "top_up"
  | "order_payment"
  | "refund"
  | "adjustment";

export interface RecordTransactionInput {
  type: WalletTransactionType;
  amountCents: number;
  referenceType?: "order" | "paystack";
  referenceId?: string | number;
  description?: string;
}

/**
 * Returns the current wallet balance in cents for a user.
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const { rows } = await db.execute({
    sql: "SELECT wallet_balance_cents FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  const row = rows[0];
  if (!row || typeof row.wallet_balance_cents === "undefined") {
    return 0;
  }
  return Number(row.wallet_balance_cents) || 0;
}

/**
 * Records a wallet transaction and updates the user's balance atomically.
 * amountCents: positive = credit, negative = debit.
 */
export async function recordTransaction(
  userId: string,
  input: RecordTransactionInput
): Promise<void> {
  const { type, amountCents, referenceType, referenceId, description } = input;
  const refIdStr =
    referenceId !== undefined && referenceId !== null
      ? String(referenceId)
      : null;

  const tx = await db.transaction("write");
  try {
    const { rows } = await tx.execute({
      sql: "SELECT wallet_balance_cents FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });
    const row = rows[0];
    if (!row) {
      throw new Error("User not found");
    }
    const currentCents = Number(row.wallet_balance_cents) || 0;
    const balanceAfterCents = currentCents + amountCents;

    if (balanceAfterCents < 0) {
      throw new Error("Insufficient wallet balance");
    }

    await tx.execute({
      sql: "UPDATE users SET wallet_balance_cents = ?, updated_at = datetime('now') WHERE id = ?",
      args: [balanceAfterCents, userId],
    });

    await tx.execute({
      sql: `INSERT INTO wallet_transactions (
        user_id, type, amount_cents, reference_type, reference_id, balance_after_cents, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        type,
        amountCents,
        referenceType ?? null,
        refIdStr,
        balanceAfterCents,
        description ?? null,
      ],
    });

    await tx.commit();
  } finally {
    await tx.close();
  }
}

export interface DeductForOrderResult {
  ok: boolean;
  error?: string;
}

/**
 * Deducts totalCents from the user's wallet for an order. Idempotent: if a
 * transaction for this order already exists, returns success without deducting again.
 */
export async function deductForOrder(
  userId: string,
  orderId: number,
  totalCents: number,
  description?: string
): Promise<DeductForOrderResult> {
  const orderIdStr = String(orderId);

  const { rows: existing } = await db.execute({
    sql: `SELECT 1 FROM wallet_transactions
          WHERE user_id = ? AND reference_type = 'order' AND reference_id = ?
          LIMIT 1`,
    args: [userId, orderIdStr],
  });

  if (existing.length > 0) {
    return { ok: true };
  }

  const balance = await getWalletBalance(userId);
  if (balance < totalCents) {
    return { ok: false, error: "Insufficient wallet balance" };
  }

  try {
    await recordTransaction(userId, {
      type: "order_payment",
      amountCents: -totalCents,
      referenceType: "order",
      referenceId: orderIdStr,
      description: description ?? `Payment for order #${orderId}`,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deduction failed";
    return { ok: false, error: message };
  }
}

export interface RefundForOrderResult {
  ok: boolean;
  error?: string;
}

/**
 * Credits the user's wallet when an order paid with WALLET is refunded/cancelled.
 * Idempotent: if a refund transaction for this order already exists, returns success without crediting again.
 */
export async function refundForOrder(
  userId: string,
  orderId: number,
  totalCents: number,
  orderNumber?: string
): Promise<RefundForOrderResult> {
  const orderIdStr = String(orderId);

  const { rows: existing } = await db.execute({
    sql: `SELECT 1 FROM wallet_transactions
          WHERE user_id = ? AND type = 'refund' AND reference_type = 'order' AND reference_id = ?
          LIMIT 1`,
    args: [userId, orderIdStr],
  });

  if (existing.length > 0) {
    return { ok: true };
  }

  try {
    await recordTransaction(userId, {
      type: "refund",
      amountCents: totalCents,
      referenceType: "order",
      referenceId: orderIdStr,
      description: orderNumber ? `Refund for order ${orderNumber}` : `Refund for order #${orderId}`,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refund failed";
    return { ok: false, error: message };
  }
}
