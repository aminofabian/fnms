/**
 * Add delivery/payment columns to orders and unit_price_cents to order_items.
 * Run: bun run scripts/migrate-orders.ts
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
  "ALTER TABLE orders ADD COLUMN service_area_id INTEGER REFERENCES service_areas(id)",
  "ALTER TABLE orders ADD COLUMN recipient_name TEXT",
  "ALTER TABLE orders ADD COLUMN recipient_phone TEXT",
  "ALTER TABLE orders ADD COLUMN delivery_address TEXT",
  "ALTER TABLE orders ADD COLUMN delivery_notes TEXT",
  "ALTER TABLE orders ADD COLUMN payment_method TEXT",
  "ALTER TABLE orders ADD COLUMN payment_status TEXT",
  "ALTER TABLE order_items ADD COLUMN unit_price_cents INTEGER",
];

for (const sql of statements) {
  try {
    await db.execute(sql);
    console.log("OK:", sql.slice(0, 55) + "...");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name")) {
      console.log("Skip (column exists):", sql.slice(0, 55) + "...");
    } else {
      console.error("Error:", sql, msg);
    }
  }
}

console.log("Done.");
