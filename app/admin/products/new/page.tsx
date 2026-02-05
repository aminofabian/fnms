import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import type { Category } from "@/types/category";

async function getCategories(): Promise<Category[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM categories ORDER BY sort_order, name",
    args: [],
  });
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
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
  });
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Add Product</h1>
      <p className="mt-1 text-muted-foreground">Create a new product.</p>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
