import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

async function getProduct(id: string): Promise<Product | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM products WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  const productId = Number(r.id);

  const [imgRes, varRes] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order", args: [productId] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE product_id = ?", args: [productId] }),
  ]);

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
    images: (imgRes.rows as Record<string, unknown>[]).map((i) => ({
      id: Number(i.id),
      productId: Number(i.product_id),
      url: String(i.url),
      alt: i.alt ? String(i.alt) : null,
      sortOrder: Number(i.sort_order),
    })),
    variants: (varRes.rows as Record<string, unknown>[]).map((v) => ({
      id: Number(v.id),
      productId: Number(v.product_id),
      name: String(v.name),
      sku: v.sku ? String(v.sku) : null,
      priceCents: Number(v.price_cents),
      stockQuantity: Number(v.stock_quantity),
    })),
  };
}

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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Edit Product</h1>
      <p className="mt-1 text-muted-foreground">{product.name}</p>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
