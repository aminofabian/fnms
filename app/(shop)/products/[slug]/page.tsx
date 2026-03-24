import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";
import { ProductImage } from "@/components/products/product-image";
import { ProductInfo } from "@/components/products/product-info";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist";
import { ReviewList } from "@/components/reviews";
import { JsonLdProduct } from "@/components/seo/json-ld-product";
import { getProductBySlug } from "@/lib/products/get-product-by-slug";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);

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
