import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/delivery-areas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/delivery-info`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let areaPages: MetadataRoute.Sitemap = [];

  try {
    const [catRes, prodRes, areaRes] = await Promise.all([
      db.execute({ sql: "SELECT slug, updated_at FROM categories ORDER BY slug", args: [] }),
      db.execute({ sql: "SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY slug", args: [] }),
      db.execute({ sql: "SELECT slug, updated_at FROM service_areas WHERE is_active = 1 ORDER BY slug", args: [] }),
    ]);

    categoryPages = (catRes.rows as unknown as { slug: string; updated_at: string }[]).map((row) => ({
      url: `${baseUrl}/categories/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    productPages = (prodRes.rows as unknown as { slug: string; updated_at: string }[]).map((row) => ({
      url: `${baseUrl}/products/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    areaPages = (areaRes.rows as unknown as { slug: string; updated_at: string }[]).map((row) => ({
      url: `${baseUrl}/delivery-areas/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.warn("Sitemap: could not fetch dynamic routes", e);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...areaPages];
}
