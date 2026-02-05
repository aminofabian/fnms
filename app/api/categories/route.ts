import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations/category";
import type { Category } from "@/types/category";

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// GET /api/categories - List all categories
export async function GET() {
  try {
    const { rows } = await db.execute({
      sql: "SELECT * FROM categories ORDER BY sort_order, name",
      args: [],
    });

    const categories = rows.map((row) => rowToCategory(row as Record<string, unknown>));
    return NextResponse.json(categories);
  } catch (e) {
    console.error("Categories GET error:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { slug, name, description, imageUrl, sortOrder } = parsed.data;

    // Check for duplicate slug
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    await db.execute({
      sql: `INSERT INTO categories (slug, name, description, image_url, sort_order)
            VALUES (?, ?, ?, ?, ?)`,
      args: [slug, name, description ?? null, imageUrl ?? null, sortOrder ?? 0],
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    return NextResponse.json(rowToCategory(rows[0] as Record<string, unknown>), { status: 201 });
  } catch (e) {
    console.error("Categories POST error:", e);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
