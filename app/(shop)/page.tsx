import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { HeroBanner } from "@/components/home/hero-banner";
import { DeliveryAreasBlock } from "@/components/home/delivery-areas-block";
import { AreaPromptBanner } from "@/components/home/area-prompt-banner";
import { CategoryPills } from "@/components/home/category-pills";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductGrid } from "@/components/home/product-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { QuickCart } from "@/components/home/quick-cart";
import { DealsCarousel } from "../../components/home/deals-carousel";
import type { Category } from "@/types/category";
import type { Product, ProductImage } from "@/types/product";
import type { ServiceArea } from "@/types/service-area";

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

async function getServiceAreas(): Promise<ServiceArea[]> {
  const { rows } = await db.execute(
    "SELECT * FROM service_areas ORDER BY name ASC"
  );
  return rows
    .map((r) => ({
      id: Number(r.id),
      slug: String(r.slug),
      name: String(r.name),
      deliveryFeeCents: r.delivery_fee_cents != null ? Number(r.delivery_fee_cents) : 0,
      minOrderCents: r.min_order_cents != null ? Number(r.min_order_cents) : 0,
      estimatedTime: r.estimated_time ? String(r.estimated_time) : null,
      isActive: r.is_active != null ? Boolean(r.is_active) : true,
      createdAt: String(r.created_at),
      updatedAt: r.updated_at ? String(r.updated_at) : String(r.created_at),
    }))
    .filter((area) => area.isActive);
}

export default async function HomePage() {
  const [categories, products, areas] = await Promise.all([
    getCategories(),
    getProducts(),
    getServiceAreas(),
  ]);

  const deals = products.filter(
    (p) => p.compareAtCents && p.compareAtCents > p.priceCents
  );

  return (
    <>
      <Header />
      <main className="min-h-screen pb-28">
        <HeroBanner areas={areas} />

        <div className="container mx-auto px-4 py-4 sm:py-5">
          {/* Delivery locations first */}
          <DeliveryAreasBlock areas={areas} />
          <AreaPromptBanner />

          {/* Category pills — quick nav */}
          {categories.length > 0 && (
            <section className="mb-4 sm:mb-6" aria-label="Browse by category">
              <h2 className="sr-only">Browse by category</h2>
              <CategoryPills categories={categories} />
            </section>
          )}

          {/* Shop by category — visual grid */}
          {categories.length > 0 && (
            <section className="mb-6 sm:mb-8">
              <FeaturedCategories categories={categories} />
            </section>
          )}

          {/* Today's offers */}
          {deals.length > 0 && (
            <section className="mb-6 sm:mb-8" aria-label="Today's offers">
              <DealsCarousel deals={deals} />
            </section>
          )}

          {/* How it works — trust */}
          <section className="mb-6 sm:mb-8">
            <HowItWorks />
          </section>

          {/* All products */}
          <section className="mb-8" aria-label="All products">
            <ProductGrid products={products} title="Shop All Products" />
          </section>
        </div>
      </main>

      <QuickCart />
    </>
  );
}
