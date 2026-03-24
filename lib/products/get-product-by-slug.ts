import { db } from "@/lib/db";
import type { Product, ProductImage as ProductImageType, ProductVariant } from "@/types/product";

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM products WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  const productId = Number(r.id);

  const [imgRes, varRes, catRes] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order", args: [productId] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE product_id = ?", args: [productId] }),
    db.execute({ sql: "SELECT * FROM categories WHERE id = ? LIMIT 1", args: [Number(r.category_id)] }),
  ]);

  const images: ProductImageType[] = (imgRes.rows as Record<string, unknown>[]).map((i) => ({
    id: Number(i.id),
    productId: Number(i.product_id),
    url: String(i.url),
    alt: i.alt ? String(i.alt) : null,
    sortOrder: Number(i.sort_order),
  }));

  const variants: ProductVariant[] = (varRes.rows as Record<string, unknown>[]).map((v) => ({
    id: Number(v.id),
    productId: Number(v.product_id),
    name: String(v.name),
    sku: v.sku ? String(v.sku) : null,
    priceCents: Number(v.price_cents),
    stockQuantity: Number(v.stock_quantity),
  }));

  const category = catRes.rows[0] as Record<string, unknown> | undefined;

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
    images,
    variants,
    category: category
      ? {
          id: Number(category.id),
          slug: String(category.slug),
          name: String(category.name),
          description: category.description ? String(category.description) : null,
          imageUrl: category.image_url ? String(category.image_url) : null,
          sortOrder: Number(category.sort_order),
          createdAt: String(category.created_at),
          updatedAt: String(category.updated_at),
        }
      : undefined,
  };
}
