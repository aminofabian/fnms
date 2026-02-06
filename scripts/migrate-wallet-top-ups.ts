/**
 * Create wallet_top_ups table for Paystack top-up flow.
 * Run: bun run scripts/migrate-wallet-top-ups.ts
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
  `CREATE TABLE IF NOT EXISTS wallet_top_ups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paystack_reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  "CREATE INDEX IF NOT EXISTS idx_wallet_top_ups_user_id ON wallet_top_ups(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_wallet_top_ups_paystack_reference ON wallet_top_ups(paystack_reference)",
];

for (const sql of statements) {
  try {
    await db.execute(sql);
    console.log("OK:", sql.slice(0, 55).replace(/\s+/g, " ") + "...");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) {
      console.log("Skip (already applied):", sql.slice(0, 55).replace(/\s+/g, " ") + "...");
    } else {
      console.error("Error:", msg);
      throw e;
    }
  }
}

console.log("Wallet top-ups migration done.");
