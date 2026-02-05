import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Product, ProductImage, ProductVariant } from "@/types/product";

function rowToProduct(row: Record<string, unknown>, images: ProductImage[] = [], variants: ProductVariant[] = []): Product {
  return {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    priceCents: Number(row.price_cents),
    compareAtCents: row.compare_at_cents != null ? Number(row.compare_at_cents) : null,
    unit: row.unit ? String(row.unit) : null,
    stockQuantity: Number(row.stock_quantity),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    images,
    variants,
  };
}

// GET /api/products/featured - First 8 active products (no is_featured column, use recent)
export async function GET() {
  try {
    const { rows } = await db.execute({
      sql: "SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT 8",
      args: [],
    });

    const products: Product[] = [];
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const productId = Number(r.id);
      const [imgRes] = await Promise.all([
        db.execute({ sql: "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order", args: [productId] }),
        db.execute({ sql: "SELECT * FROM product_variants WHERE product_id = ?", args: [productId] }),
      ]);
      const images: ProductImage[] = (imgRes.rows as Record<string, unknown>[]).map((i) => ({
        id: Number(i.id),
        productId: Number(i.product_id),
        url: String(i.url),
        alt: i.alt ? String(i.alt) : null,
        sortOrder: Number(i.sort_order),
      }));
      const varRes = await db.execute({ sql: "SELECT * FROM product_variants WHERE product_id = ?", args: [productId] });
      const variants: ProductVariant[] = (varRes.rows as Record<string, unknown>[]).map((v) => ({
        id: Number(v.id),
        productId: Number(v.product_id),
        name: String(v.name),
        sku: v.sku ? String(v.sku) : null,
        priceCents: Number(v.price_cents),
        stockQuantity: Number(v.stock_quantity),
      }));
      products.push(rowToProduct(r, images, variants));
    }

    return NextResponse.json(products);
  } catch (e) {
    console.error("Featured products GET error:", e);
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 });
  }
}
