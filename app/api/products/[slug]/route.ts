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

async function getProductBySlug(slug: string): Promise<Product | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM products WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
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

  return rowToProduct(r, images, variants);
}

// GET /api/products/[slug]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    console.error("Product GET error:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/products/[slug]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    const fieldMap: [keyof typeof parsed.data, string][] = [
      ["categoryId", "category_id"],
      ["slug", "slug"],
      ["name", "name"],
      ["description", "description"],
      ["priceCents", "price_cents"],
      ["compareAtCents", "compare_at_cents"],
      ["unit", "unit"],
      ["stockQuantity", "stock_quantity"],
      ["isActive", "is_active"],
    ];

    for (const [key, col] of fieldMap) {
      const val = parsed.data[key];
      if (val === undefined) continue;
      updates.push(`${col} = ?`);
      args.push(key === "isActive" ? (val ? 1 : 0) : (val as string | number));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(slug);

    await db.execute({
      sql: `UPDATE products SET ${updates.join(", ")} WHERE slug = ?`,
      args,
    });

    const newSlug = parsed.data.slug ?? slug;
    const product = await getProductBySlug(newSlug);
    return NextResponse.json(product);
  } catch (e) {
    console.error("Product PUT error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[slug]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { rows } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await db.execute({ sql: "DELETE FROM products WHERE slug = ?", args: [slug] });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Product DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
