// src/components/seo/OrganizationSchema.tsx
import JsonLd from "./JsonLd";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  socialLinks?: string[];
}

/**
 * Organization JSON-LD Schema
 * Cateringle şirket bilgileri için
 */
export default function OrganizationSchema({
  name = "Cateringle",
  url = "https://cateringle.com",
  logo = "https://cateringle.com/logo.png",
  description = "Türkiye'nin catering firmaları platformu",
  email = "info@cateringle.com",
  socialLinks = [],
}: OrganizationSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    description,
    email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
    },
  };

  if (socialLinks.length > 0) {
    data.sameAs = socialLinks;
  }

  return <JsonLd data={data} />;
}
