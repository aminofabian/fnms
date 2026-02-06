-- Wallet top-ups: pending Paystack payments for wallet credit.
-- Run: turso db shell <db-name> < sql/migrations/004_wallet_top_ups.sql

CREATE TABLE IF NOT EXISTS wallet_top_ups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paystack_reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_top_ups_user_id ON wallet_top_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_top_ups_paystack_reference ON wallet_top_ups(paystack_reference);
