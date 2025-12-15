// src/components/seo/WebSiteSchema.tsx
import JsonLd from "./JsonLd";

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
  searchUrl?: string;
}

/**
 * WebSite JSON-LD Schema
 * Ana sayfa için - Google arama kutusu
 */
export default function WebSiteSchema({
  name = "Cateringle.com",
  url = "https://cateringle.com",
  description = "Türkiye'nin catering firmaları platformu. Kurumsal ve bireysel etkinlikler için en iyi catering firmalarını bulun.",
  searchUrl = "https://cateringle.com/vendors?q={search_term_string}",
}: WebSiteSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Cateringle",
      url,
      logo: {
        "@type": "ImageObject",
        url: `${url}/logo.png`,
      },
    },
  };

  return <JsonLd data={data} />;
}
