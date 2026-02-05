-- Add columns to service_areas if your DB was created with the old schema.
-- Run: turso db shell <db-name> < sql/migrations/001_service_areas_columns.sql
-- Or run each statement in Turso dashboard.

-- SQLite doesn't support IF NOT EXISTS for columns; use one of these approaches:
-- 1. Run once. If column already exists you'll get an error (safe to ignore).
-- 2. Or run the whole script; first run may add columns, second run will error (ignore).

ALTER TABLE service_areas ADD COLUMN delivery_fee_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE service_areas ADD COLUMN min_order_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE service_areas ADD COLUMN estimated_time TEXT;
ALTER TABLE service_areas ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE service_areas ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));
