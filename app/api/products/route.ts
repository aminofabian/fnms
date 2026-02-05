import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";
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

// GET /api/products - List products (optional: category, search)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    let sql = `
      SELECT p.* FROM products p
      WHERE p.is_active = 1
    `;
    const args: (string | number)[] = [];

    if (categorySlug) {
      sql += ` AND EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id AND c.slug = ?)`;
      args.push(categorySlug);
    }
    if (search && search.trim()) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      args.push(term, term);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const { rows } = await db.execute({ sql, args });
    const products: Product[] = [];

    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const productId = Number(r.id);

      const [imgRes, varRes] = await Promise.all([
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
    console.error("Products GET error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products - Create product (admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryId, slug, name, description, priceCents, compareAtCents, unit, stockQuantity, isActive } = parsed.data;

    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    await db.execute({
      sql: `INSERT INTO products (category_id, slug, name, description, price_cents, compare_at_cents, unit, stock_quantity, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        categoryId,
        slug,
        name,
        description ?? null,
        priceCents,
        compareAtCents ?? null,
        unit ?? null,
        stockQuantity ?? 0,
        isActive !== false ? 1 : 0,
      ],
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    return NextResponse.json(rowToProduct(rows[0] as Record<string, unknown>), { status: 201 });
  } catch (e) {
    console.error("Products POST error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
