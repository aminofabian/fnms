import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/products/[slug]/images - Add image to product
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { url, alt, sortOrder } = body as { url: string; alt?: string; sortOrder?: number };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = (rows[0] as Record<string, unknown>).id as number;
    await db.execute({
      sql: "INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)",
      args: [productId, url, alt ?? null, sortOrder ?? 0],
    });

    const { rows: inserted } = await db.execute({
      sql: "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order DESC LIMIT 1",
      args: [productId],
    });

    const r = inserted[0] as Record<string, unknown>;
    return NextResponse.json({
      id: Number(r.id),
      productId: Number(r.product_id),
      url: String(r.url),
      alt: r.alt ? String(r.alt) : null,
      sortOrder: Number(r.sort_order),
    }, { status: 201 });
  } catch (e) {
    console.error("Product image POST error:", e);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
