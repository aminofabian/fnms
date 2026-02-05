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

// GET /api/categories/[slug]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { rows } = await db.execute({
      sql: "SELECT * FROM categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(rowToCategory(rows[0] as Record<string, unknown>));
  } catch (e) {
    console.error("Category GET error:", e);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PUT /api/categories/[slug]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (parsed.data.name !== undefined) {
      updates.push("name = ?");
      args.push(parsed.data.name);
    }
    if (parsed.data.slug !== undefined) {
      updates.push("slug = ?");
      args.push(parsed.data.slug);
    }
    if (parsed.data.description !== undefined) {
      updates.push("description = ?");
      args.push(parsed.data.description || null);
    }
    if (parsed.data.imageUrl !== undefined) {
      updates.push("image_url = ?");
      args.push(parsed.data.imageUrl || null);
    }
    if (parsed.data.sortOrder !== undefined) {
      updates.push("sort_order = ?");
      args.push(parsed.data.sortOrder);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(slug);

    await db.execute({
      sql: `UPDATE categories SET ${updates.join(", ")} WHERE slug = ?`,
      args,
    });

    const newSlug = parsed.data.slug ?? slug;
    const { rows } = await db.execute({
      sql: "SELECT * FROM categories WHERE slug = ? LIMIT 1",
      args: [newSlug],
    });

    return NextResponse.json(rowToCategory(rows[0] as Record<string, unknown>));
  } catch (e) {
    console.error("Category PUT error:", e);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/[slug]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { rows } = await db.execute({
      sql: "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM categories WHERE slug = ?",
      args: [slug],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Category DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
