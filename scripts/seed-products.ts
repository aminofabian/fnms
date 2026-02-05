/**
 * Seed sample products. Run after db:seed-categories.
 * bun run scripts/seed-products.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

async function getCategoryId(slug: string): Promise<number> {
  const { rows } = await db.execute({ sql: "SELECT id FROM categories WHERE slug = ? LIMIT 1", args: [slug] });
  if (rows.length === 0) throw new Error(`Category not found: ${slug}`);
  return Number((rows[0] as Record<string, unknown>).id);
}

const products = [
  { slug: "fresh-tomatoes", name: "Fresh Tomatoes", categorySlug: "fruits-vegetables", priceCents: 15000, unit: "kg" },
  { slug: "onions", name: "Onions", categorySlug: "fruits-vegetables", priceCents: 12000, unit: "kg" },
  { slug: "whole-milk-1l", name: "Whole Milk 1L", categorySlug: "dairy-eggs", priceCents: 12000, unit: "bottle" },
  { slug: "eggs-tray", name: "Eggs (Tray of 30)", categorySlug: "dairy-eggs", priceCents: 55000, unit: "tray" },
  { slug: "white-bread", name: "White Bread", categorySlug: "bread-bakery", priceCents: 6000, unit: "loaf" },
  { slug: "mineral-water-500ml", name: "Mineral Water 500ml", categorySlug: "beverages", priceCents: 5000, unit: "bottle" },
  { slug: "cooking-oil-1l", name: "Cooking Oil 1L", categorySlug: "household", priceCents: 45000, unit: "bottle" },
  { slug: "rice-2kg", name: "Rice 2kg", categorySlug: "household", priceCents: 38000, unit: "pack" },
  { slug: "sugar-1kg", name: "Sugar 1kg", categorySlug: "household", priceCents: 18000, unit: "kg" },
  { slug: "potatoes", name: "Potatoes", categorySlug: "fruits-vegetables", priceCents: 8000, unit: "kg" },
];

for (const p of products) {
  try {
    const categoryId = await getCategoryId(p.categorySlug);
    await db.execute({
      sql: `INSERT INTO products (category_id, slug, name, price_cents, unit, stock_quantity, is_active)
            VALUES (?, ?, ?, ?, ?, 100, 1)
            ON CONFLICT(slug) DO UPDATE SET name = excluded.name, price_cents = excluded.price_cents, updated_at = datetime('now')`,
      args: [categoryId, p.slug, p.name, p.priceCents, p.unit],
    });
    console.log(`Seeded: ${p.name}`);
  } catch (e) {
    console.error(`Failed ${p.name}:`, e);
  }
}

console.log("Done seeding products.");
