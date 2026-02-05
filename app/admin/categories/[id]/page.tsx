import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import type { Category } from "@/types/category";

async function getCategory(id: string): Promise<Category | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM categories WHERE id = ? LIMIT 1",
    args: [id],
  });

  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  return {
    id: Number(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: r.description ? String(r.description) : null,
    imageUrl: r.image_url ? String(r.image_url) : null,
    sortOrder: Number(r.sort_order),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-foreground">Edit Category</h1>
      <p className="mt-1 text-muted-foreground">Update category details.</p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
