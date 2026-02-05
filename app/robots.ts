import { MetadataRoute } from "next";

const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/admin/", "/api/", "/checkout/", "/login", "/register"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
