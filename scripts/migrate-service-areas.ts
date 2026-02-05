/**
 * Add new columns to service_areas (for DBs created with the old schema).
 * Run: bun run scripts/migrate-service-areas.ts
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
  "ALTER TABLE service_areas ADD COLUMN delivery_fee_cents INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE service_areas ADD COLUMN min_order_cents INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE service_areas ADD COLUMN estimated_time TEXT",
  "ALTER TABLE service_areas ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1",
  "ALTER TABLE service_areas ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'))",
];

for (const sql of statements) {
  try {
    await db.execute(sql);
    console.log("OK:", sql.slice(0, 60) + "...");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name")) {
      console.log("Skip (column exists):", sql.slice(0, 60) + "...");
    } else {
      console.error("Error:", sql, msg);
    }
  }
}

console.log("Done.");
