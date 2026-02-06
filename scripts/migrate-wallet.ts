/**
 * Add wallet balance to users and create wallet_transactions table.
 * Run: bun run scripts/migrate-wallet.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

const statements = [
  "ALTER TABLE users ADD COLUMN wallet_balance_cents INTEGER NOT NULL DEFAULT 0",
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('top_up', 'order_payment', 'refund', 'adjustment')),
  amount_cents INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  balance_after_cents INTEGER NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at)",
  "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id)",
];

for (const sql of statements) {
  try {
    await db.execute(sql);
    console.log("OK:", sql.slice(0, 60).replace(/\s+/g, " ") + "...");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name") || msg.includes("already exists")) {
      console.log("Skip (already applied):", sql.slice(0, 60).replace(/\s+/g, " ") + "...");
    } else {
      console.error("Error:", msg);
      throw e;
    }
  }
}

console.log("Wallet migration done.");
