import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";
import { ProductImage } from "@/components/products/product-image";
import { ProductInfo } from "@/components/products/product-info";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist";
import { ReviewList } from "@/components/reviews";
import { JsonLdProduct } from "@/components/seo/json-ld-product";
import type { Product, ProductImage as ProductImageType, ProductVariant } from "@/types/product";

async function getProduct(slug: string): Promise<Product | null> {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  const imageUrl = product.images?.[0]?.url;
  return {
    title: `${product.name} | FnM's Mini Mart`,
    description: product.description ?? undefined,
    openGraph: {
      title: `${product.name} | FnM's Mini Mart`,
      description: product.description ?? undefined,
      type: "website",
      ...(imageUrl && { images: [{ url: imageUrl, alt: product.name }] }),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0];

  return (
    <div className="min-h-screen bg-background">
      <JsonLdProduct product={product} />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <CategoryBreadcrumb category={product.category} productName={product.name} />

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted/30">
            <ProductImage
              src={mainImage?.url ?? null}
              alt={mainImage?.alt ?? product.name}
              className="h-full w-full"
            />
          </div>

          <div>
            <ProductInfo product={product} />
            <div className="mt-6 flex items-center gap-4">
              <AddToCartButton product={product} />
              <WishlistButton productId={product.id} size="lg" />
            </div>
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="mt-6 inline-block text-sm text-primary hover:underline"
              >
                ← More in {product.category.name}
              </Link>
            )}
          </div>
        </div>

        <section className="mt-12 border-t border-border pt-8">
          <ReviewList productSlug={product.slug} productId={product.id} />
        </section>
      </main>
    </div>
  );
}
