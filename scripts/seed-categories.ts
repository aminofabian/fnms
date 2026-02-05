/**
 * Seed initial categories into Turso.
 * Run: bun run scripts/seed-categories.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

const categories = [
  { slug: "fruits-vegetables", name: "Fruits & Vegetables", description: "Fresh fruits and vegetables", sortOrder: 1 },
  { slug: "dairy-eggs", name: "Dairy & Eggs", description: "Milk, cheese, yogurt, and eggs", sortOrder: 2 },
  { slug: "meat-poultry", name: "Meat & Poultry", description: "Fresh meat, chicken, and fish", sortOrder: 3 },
  { slug: "bread-bakery", name: "Bread & Bakery", description: "Fresh bread, pastries, and baked goods", sortOrder: 4 },
  { slug: "beverages", name: "Beverages", description: "Drinks, juices, water, and sodas", sortOrder: 5 },
  { slug: "snacks", name: "Snacks", description: "Chips, cookies, and treats", sortOrder: 6 },
  { slug: "household", name: "Household Items", description: "Cleaning supplies and household essentials", sortOrder: 7 },
  { slug: "personal-care", name: "Personal Care", description: "Toiletries and personal hygiene products", sortOrder: 8 },
];

for (const cat of categories) {
  try {
    await db.execute({
      sql: `INSERT INTO categories (slug, name, description, sort_order)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              description = excluded.description,
              sort_order = excluded.sort_order,
              updated_at = datetime('now')`,
      args: [cat.slug, cat.name, cat.description, cat.sortOrder],
    });
    console.log(`Seeded: ${cat.name}`);
  } catch (e) {
    console.error(`Failed to seed ${cat.name}:`, e);
  }
}

console.log("Done seeding categories.");
