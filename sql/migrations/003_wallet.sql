-- Wallet: user balance and transaction log.
-- Run: turso db shell <db-name> < sql/migrations/003_wallet.sql
-- Or run each statement in Turso dashboard. If a column already exists, you'll get an error (safe to ignore).

-- Users: add wallet balance (Option A – simple one balance per user)
ALTER TABLE users ADD COLUMN wallet_balance_cents INTEGER NOT NULL DEFAULT 0;

-- Wallet transactions: audit log for every balance change
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('top_up', 'order_payment', 'refund', 'adjustment')),
  amount_cents INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  balance_after_cents INTEGER NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for lookups and idempotency
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id);
