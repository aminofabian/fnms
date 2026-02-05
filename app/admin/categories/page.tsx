import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import type { Category } from "@/types/category";

async function getCategories(): Promise<Category[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM categories ORDER BY sort_order, name",
    args: [],
  });

  return rows.map((row) => {
    const r = row as Record<string, unknown>;
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
  });
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-muted-foreground">
            Manage product categories for your store.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="mt-8">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">No categories yet.</p>
            <Link
              href="/admin/categories/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Plus className="h-4 w-4" />
              Add your first category
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sort</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted" />
                        )}
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{category.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
