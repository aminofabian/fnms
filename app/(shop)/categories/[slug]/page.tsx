import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";
import { CategorySidebar } from "@/components/categories/category-sidebar";
import { ProductGrid } from "@/components/products/product-grid";
import type { Category } from "@/types/category";

async function getCategory(slug: string): Promise<Category | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM categories WHERE slug = ? LIMIT 1",
    args: [slug],
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} | FnM's Mini Mart`,
    description: category.description || `Shop ${category.name} at FnM's Mini Mart`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    getCategory(slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <CategoryBreadcrumb category={category} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <h2 className="mb-4 font-semibold text-foreground">Categories</h2>
            <CategorySidebar categories={categories} />
          </aside>

          {/* Main content */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
                {category.description && (
                  <p className="mt-1 text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <ProductGrid categorySlug={slug} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
