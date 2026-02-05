import type { Product } from "@/types/product";

const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

interface JsonLdProductProps {
  product: Product;
}

export function JsonLdProduct({ product }: JsonLdProductProps) {
  const imageUrl = product.images?.[0]?.url
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : `${baseUrl}${product.images[0].url.startsWith("/") ? "" : "/"}${product.images[0].url}`
    : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: imageUrl,
    url: `${baseUrl}/products/${product.slug}`,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "KES",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
