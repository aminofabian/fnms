import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { TopSellersSidebar } from "@/components/home/top-sellers-sidebar";
import { CategoryPills } from "@/components/home/category-pills";
import { ProductGrid } from "@/components/home/product-grid";
import { QuickCart } from "@/components/home/quick-cart";
import { DealsCarousel } from "../../components/home/deals-carousel";
import { FabMenu } from "@/components/layout/fab-menu";
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
      <main className="min-h-screen pb-24">
        {/* Green strip above hero */}
        <div
          className="px-4 py-2.5 text-center text-sm font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: "var(--nav-green)" }}
        >
          Shop FnM&apos;s — Fresh for less every day
        </div>

        {/* Hero banner with SHOP NOW overlay */}
        <section className="relative w-full border-b border-black/10 bg-muted">
          <Link href="/products" className="relative mx-auto flex max-w-[1150px] justify-center">
            <Image
              src="/banner.png"
              alt="FnM's — Fresh groceries, delivered"
              width={1150}
              height={400}
              className="h-auto max-w-full w-auto"
              priority
              sizes="(max-width: 1150px) 100vw, 1150px"
            />
            <span className="absolute bottom-4 right-4 rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase text-primary-foreground shadow-md hover:opacity-90 sm:bottom-6 sm:right-8 sm:px-6 sm:py-3 sm:text-base">
              Shop now
            </span>
          </Link>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left sidebar — TOP SELLERS */}
            {categories.length > 0 && (
              <TopSellersSidebar categories={categories} />
            )}

            <div className="min-w-0 flex-1">
              {/* Most Popular — category pills */}
              {categories.length > 0 && (
                <section
                  className="mb-8 sm:mb-10"
                  aria-labelledby="categories-heading"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2
                      id="categories-heading"
                      className="text-lg font-semibold sm:text-xl"
                      style={{ color: "var(--nav-green)" }}
                    >
                      Most Popular
                    </h2>
                    <Link
                      href="/categories"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <CategoryPills categories={categories} />
                </section>
              )}

              {/* Today&apos;s offers */}
              {deals.length > 0 && (
                <section
                  className="mb-8 sm:mb-10"
                  aria-labelledby="deals-heading"
                >
                  <DealsCarousel deals={deals} />
                </section>
              )}

              {/* All products */}
              <section aria-labelledby="products-heading">
                <ProductGrid
                  products={products}
                  title="All products"
                  titleId="products-heading"
                  titleClassName="[color:var(--nav-green)]"
                />
              </section>
            </div>
          </div>
        </div>
      </main>

      <QuickCart />
      <FabMenu />
    </>
  );
}
