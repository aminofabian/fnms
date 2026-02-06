import type { Product } from "@/types/product";

const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

interface HomePageJsonLdProps {
  products: Product[];
}

export function HomePageJsonLd({ products }: HomePageJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: "FnM's Mini Mart | Fresh Groceries Delivered in Nairobi",
        description:
          "Shop fresh groceries, everyday essentials, and household items—delivered to your door in Nairobi. Fast delivery, great prices.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#organization` },
        inLanguage: "en-KE",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl }],
        },
      },
      ...(products.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${baseUrl}/#product-list`,
              name: "Groceries and essentials",
              description: "Fresh groceries and everyday essentials available for delivery.",
              numberOfItems: products.length,
              itemListElement: products.slice(0, 20).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${baseUrl}/products/${p.slug}`,
                name: p.name,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
