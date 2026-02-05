-- Add delivery and payment columns to orders (for checkout flow).
-- Run: turso db shell <db-name> < sql/migrations/002_orders_delivery_payment.sql
-- Or run each statement in Turso dashboard. If a column already exists, you'll get an error (safe to ignore).

-- Orders: delivery and payment fields
ALTER TABLE orders ADD COLUMN service_area_id INTEGER REFERENCES service_areas(id);
ALTER TABLE orders ADD COLUMN recipient_name TEXT;
ALTER TABLE orders ADD COLUMN recipient_phone TEXT;
ALTER TABLE orders ADD COLUMN delivery_address TEXT;
ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN payment_method TEXT;
ALTER TABLE orders ADD COLUMN payment_status TEXT;

-- Allow guest checkout (nullable user_id)
-- SQLite: recreate table to change NOT NULL. Skip if your orders already allow NULL user_id.
-- If you need this, run the block below (uncomment and run manually if desired):
/*
CREATE TABLE orders_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  address_snapshot TEXT,
  promo_code_id INTEGER REFERENCES promo_codes(id),
  notes TEXT,
  service_area_id INTEGER REFERENCES service_areas(id),
  recipient_name TEXT,
  recipient_phone TEXT,
  delivery_address TEXT,
  delivery_notes TEXT,
  payment_method TEXT,
  payment_status TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO orders_new SELECT id, user_id, order_number, status, subtotal_cents, delivery_fee_cents, discount_cents, total_cents, address_snapshot, promo_code_id, notes, service_area_id, recipient_name, recipient_phone, delivery_address, delivery_notes, payment_method, payment_status, created_at, updated_at FROM orders;
DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
*/

-- Order items: add unit_price_cents for API compatibility (init has price_cents/total_cents/name)
ALTER TABLE order_items ADD COLUMN unit_price_cents INTEGER;
