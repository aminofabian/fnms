import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { TopSellersSidebar } from "@/components/home/top-sellers-sidebar";
import { ProductFilterBar } from "@/components/home/product-filter-bar";
import { HomeDealsSection } from "../../components/home/home-deals-section";
import { CartFooterBar } from "../../components/layout/cart-footer-bar";
import { HomePageJsonLd } from "../../components/seo/home-page-json-ld";
import type { Category } from "@/types/category";
import type { Product, ProductImage } from "@/types/product";

const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

export const metadata: Metadata = {
  title: "FnM's Mini Mart | Fresh Groceries Delivered in Nairobi",
  description:
    "Shop fresh groceries, everyday essentials, and household items—delivered to your door in Nairobi. Fast delivery, great prices. Order online from FnM's Mini Mart.",
  keywords: [
    "grocery delivery Nairobi",
    "online grocery shop Kenya",
    "fresh groceries",
    "mini mart",
    "FnM's",
    "groceries delivered",
    "essentials delivery",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "FnM's Mini Mart | Fresh Groceries Delivered in Nairobi",
    description:
      "Shop fresh groceries and essentials—delivered to your door in Nairobi. Fast delivery, great prices.",
    url: baseUrl,
    siteName: "FnM's Mini Mart",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 1150,
        height: 400,
        alt: "FnM's — Fresh groceries, delivered",
      },
      { url: "/fnms.png", width: 1200, height: 630, alt: "FnM's Mini Mart Logo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FnM's Mini Mart | Fresh Groceries Delivered in Nairobi",
    description: "Shop fresh groceries and essentials—delivered to your door in Nairobi.",
  },
};
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
      <HomePageJsonLd products={products} />
      <Header />
      <main className="min-h-screen pb-20">
        <h1 className="sr-only">
          Fresh groceries and essentials, delivered in Nairobi — FnM&apos;s Mini Mart
        </h1>
        {/* Sidebar right next to banner image — same height on desktop, sidebar scrolls */}
        <div className="mx-auto mt-4 flex w-full max-w-[1406px] flex-col border-b border-black/10 bg-muted px-4 lg:mt-6 lg:flex lg:h-[400px] lg:flex-row lg:px-6">
          {categories.length > 0 && (
            <TopSellersSidebar categories={categories} />
          )}
          <section className="relative my-4 ml-4 overflow-hidden bg-muted lg:my-0 lg:ml-0 lg:flex-1 lg:min-w-0">
            <Link href="/products" className="relative block lg:h-full">
              <Image
                src="/banner.png"
                alt="FnM's — Fresh groceries, delivered"
                width={1150}
                height={400}
                className="h-auto w-full max-w-full lg:h-full lg:w-full lg:object-cover"
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
          <HomeDealsSection deals={deals} />

          <section aria-label="Products">
            <ProductFilterBar initialProducts={products} categories={categories} />
          </section>
        </div>
      </main>

      <CartFooterBar />
    </>
  );
}
