import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/products/product-grid";
import { SearchBar } from "@/components/products/search-bar";
import { db } from "@/lib/db";
import type { Product } from "@/types/product";

export const metadata = {
  title: "Search | FnM's Mini Mart",
  description: "Search for products at FnM's Mini Mart.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />}>
          <SearchBar />
        </Suspense>

        <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-muted" />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q?.trim()) {
    return (
      <p className="mt-8 text-muted-foreground">
        Enter a search term to find products.
      </p>
    );
  }

  const term = `%${q.trim()}%`;
  const { rows } = await db.execute({
    sql: `SELECT * FROM products WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?) ORDER BY name LIMIT 50`,
    args: [term, term],
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

  if (products.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        No products found for &quot;{q}&quot;.
      </p>
    );
  }

  return (
    <>
      <h1 className="mt-8 text-2xl font-bold text-foreground">
        Results for &quot;{q}&quot;
      </h1>
      <div className="mt-6">
        <ProductGrid initialProducts={products} />
      </div>
    </>
  );
}
