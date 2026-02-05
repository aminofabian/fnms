import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Product } from "@/types/product";

// GET /api/products/search?q=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const term = `%${q}%`;
    const { rows } = await db.execute({
      sql: `SELECT * FROM products WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?) ORDER BY name LIMIT ?`,
      args: [term, term, limit],
    });

    const products: Product[] = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        categoryId: Number(r.category_id),
        slug: String(r.slug),
        name: String(r.name),
        description: r.description ? String(r.description) : null,
        priceCents: Number(r.price_cents),
        compareAtCents: r.compare_at_cents != null ? Number(r.compare_at_cents) : null,
        unit: r.unit ? String(r.unit) : null,
        stockQuantity: Number(r.stock_quantity),
        isActive: Boolean(r.is_active),
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      };
    });

    return NextResponse.json(products);
  } catch (e) {
    console.error("Product search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
