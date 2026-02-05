import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { TopSellersSidebar } from "@/components/home/top-sellers-sidebar";
import { ProductFilterBar } from "@/components/home/product-filter-bar";
import { DealsCarousel } from "../../components/home/deals-carousel";
import { CartFooterBar } from "../../components/layout/cart-footer-bar";
import type { Category } from "@/types/category";
import type { Product, ProductImage } from "@/types/product";
async function getCategories(): Promise<Category[]> {
  const { rows } = await db.execute(
    "SELECT * FROM categories ORDER BY sort_order ASC"
  );
  return rows.map((r) => ({
    id: Number(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: r.description ? String(r.description) : null,
    imageUrl: r.image_url ? String(r.image_url) : null,
    sortOrder: Number(r.sort_order),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

async function getProducts(): Promise<Product[]> {
  const { rows } = await db.execute(
    "SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC"
  );

  const products: Product[] = rows.map((r) => ({
    id: Number(r.id),
    categoryId: Number(r.category_id),
    slug: String(r.slug),
    name: String(r.name),
    description: r.description ? String(r.description) : null,
    priceCents: Number(r.price_cents),
    compareAtCents: r.compare_at_cents ? Number(r.compare_at_cents) : null,
    unit: r.unit ? String(r.unit) : null,
    stockQuantity: Number(r.stock_quantity),
    isActive: Boolean(r.is_active),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    images: [],
  }));

  if (products.length > 0) {
    const productIds = products.map((p) => p.id);
    const placeholders = productIds.map(() => "?").join(",");
    const { rows: imageRows } = await db.execute({
      sql: `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
      args: productIds,
    });

    const imagesByProduct = new Map<number, ProductImage[]>();
    for (const img of imageRows) {
      const productId = Number(img.product_id);
      if (!imagesByProduct.has(productId)) {
        imagesByProduct.set(productId, []);
      }
      imagesByProduct.get(productId)!.push({
        id: Number(img.id),
        productId,
        url: String(img.url),
        alt: img.alt ? String(img.alt) : null,
        sortOrder: Number(img.sort_order),
      });
    }

    for (const product of products) {
      product.images = imagesByProduct.get(product.id) ?? [];
    }
  }

  return products;
}

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const deals = products.filter(
    (p) => p.compareAtCents && p.compareAtCents > p.priceCents
  );

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20">
        {/* Sidebar right next to banner image */}
        <div className="flex flex-col border-b border-black/10 bg-muted lg:flex-row lg:justify-center">
          {categories.length > 0 && (
            <TopSellersSidebar categories={categories} />
          )}
          <section className="relative my-4 ml-4 shrink-0 bg-muted lg:max-w-[1150px]">
            <Link href="/products" className="relative block">
              <Image
                src="/banner.png"
                alt="FnM's — Fresh groceries, delivered"
                width={1150}
                height={400}
                className="h-auto w-full max-w-full lg:w-[1150px]"
                priority
                sizes="(max-width: 1024px) 100vw, 1150px"
              />
              <span className="absolute bottom-4 right-4 rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase text-primary-foreground shadow-md hover:opacity-90 sm:bottom-6 sm:right-8 sm:px-6 sm:py-3 sm:text-base">
                Shop now
              </span>
            </Link>
          </section>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {/* Today&apos;s offers */}
          {deals.length > 0 && (
            <section
              className="mb-8 sm:mb-10"
              aria-labelledby="deals-heading"
            >
              <DealsCarousel deals={deals} />
            </section>
          )}

          <section aria-label="Products">
            <ProductFilterBar initialProducts={products} categories={categories} />
          </section>
        </div>
      </main>

      <CartFooterBar />
    </>
  );
}
