-- Users: add blocked flag for admin (blocked users cannot sign in).
-- Run: turso db shell <db-name> < sql/migrations/005_users_blocked.sql

ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(blocked);
