const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke";

export function JsonLdOrganization() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "FnM's Mini Mart",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/fnms.png`,
        },
        description: "Your neighbourhood online grocery store. Fresh groceries and essentials delivered to your door.",
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "FnM's Mini Mart",
        description: "Shop fresh groceries, everyday essentials, and more—delivered to your door.",
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "en-KE",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
