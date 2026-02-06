import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { ProductsTable } from "@/components/admin/products-table";
import type { Product } from "@/types/product";

function likePattern(s: string): string {
  const escaped = s.replace(/[%_\\]/g, "\\$&");
  return `%${escaped}%`;
}

async function getProducts(search?: string): Promise<(Product & { categoryName?: string })[]> {
  const pattern = search?.trim() ? likePattern(search.trim()) : null;
  const { rows } = await db.execute({
    sql: pattern
      ? `SELECT p.*, c.name as category_name FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE (p.name LIKE ? OR p.slug LIKE ?)
         ORDER BY p.created_at DESC`
      : `SELECT p.*, c.name as category_name FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.created_at DESC`,
    args: pattern ? [pattern, pattern] : [],
  });

  return rows.map((row) => {
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
      categoryName: r.category_name ? String(r.category_name) : undefined,
    };
  });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search: searchQuery } = await searchParams;
  const products = await getProducts(searchQuery);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <form method="get" action="/admin/products" className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="search"
          defaultValue={searchQuery ?? ""}
          placeholder="Search products by name or slug..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          aria-label="Search products"
        />
      </form>

      <div className="mt-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">No products yet.</p>
            <Link href="/admin/products/new" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Plus className="h-4 w-4" />
              Add your first product
            </Link>
          </div>
        ) : (
          <ProductsTable products={products} />
        )}
      </div>
    </div>
  );
}
