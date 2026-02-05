import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { CategoryGrid } from "@/components/categories/category-grid";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";
import type { Category } from "@/types/category";

export const metadata = {
  title: "Categories | FnM's Mini Mart",
  description: "Browse our product categories. Fresh groceries, household items, and more.",
};

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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <CategoryBreadcrumb />

        <h1 className="mt-4 text-3xl font-bold text-foreground">Shop by Category</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our wide selection of fresh groceries and household essentials.
        </p>

        <section className="mt-8">
          <CategoryGrid categories={categories} />
        </section>
      </main>
    </div>
  );
}
