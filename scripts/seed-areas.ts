/**
 * Seed initial service areas into Turso.
 * Run: bun run scripts/seed-areas.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

const areas = [
  { slug: "mirema", name: "Mirema", deliveryFeeCents: 10000, minOrderCents: 50000, estimatedTime: "30-45 min" },
  { slug: "roysambu", name: "Roysambu", deliveryFeeCents: 10000, minOrderCents: 50000, estimatedTime: "30-45 min" },
  { slug: "thome", name: "Thome", deliveryFeeCents: 15000, minOrderCents: 50000, estimatedTime: "45-60 min" },
  { slug: "kasarani", name: "Kasarani", deliveryFeeCents: 15000, minOrderCents: 50000, estimatedTime: "45-60 min" },
  { slug: "garden-estate", name: "Garden Estate", deliveryFeeCents: 10000, minOrderCents: 50000, estimatedTime: "30-45 min" },
  { slug: "zimmerman", name: "Zimmerman", deliveryFeeCents: 15000, minOrderCents: 50000, estimatedTime: "45-60 min" },
];

for (const area of areas) {
  try {
    await db.execute({
      sql: `INSERT INTO service_areas (slug, name, delivery_fee_cents, min_order_cents, estimated_time, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              delivery_fee_cents = excluded.delivery_fee_cents,
              min_order_cents = excluded.min_order_cents,
              estimated_time = excluded.estimated_time,
              updated_at = datetime('now')`,
      args: [area.slug, area.name, area.deliveryFeeCents, area.minOrderCents, area.estimatedTime],
    });
    console.log(`Seeded: ${area.name}`);
  } catch (e) {
    console.error(`Failed to seed ${area.name}:`, e);
  }
}

console.log("Done seeding service areas.");
