import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

async function getProducts(): Promise<(Product & { categoryName?: string })[]> {
  const { rows } = await db.execute({
    sql: `SELECT p.*, c.name as category_name FROM products p
          LEFT JOIN categories c ON c.id = p.category_id
          ORDER BY p.created_at DESC`,
    args: [],
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

export default async function AdminProductsPage() {
  const products = await getProducts();

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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.categoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm">KES {(p.priceCents / 100).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
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
