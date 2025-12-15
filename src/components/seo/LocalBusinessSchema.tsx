// src/components/seo/LocalBusinessSchema.tsx
import JsonLd from "./JsonLd";

interface LocalBusinessSchemaProps {
  name: string;
  description?: string | null;
  url: string;
  logo?: string | null;
  telephone?: string | null;
  email?: string | null;
  address?: {
    city?: string | null;
    district?: string | null;
    addressText?: string | null;
  };
  priceRange?: string | null;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  } | null;
  openingHours?: string[];
  images?: string[];
  serviceArea?: string[];
}

/**
 * LocalBusiness JSON-LD Schema
 * Catering firmaları için - Google'da zengin snippet
 */
export default function LocalBusinessSchema({
  name,
  description,
  url,
  logo,
  telephone,
  email,
  address,
  priceRange,
  rating,
  images,
  serviceArea,
}: LocalBusinessSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FoodService",
    name,
    url,
    ...(description && { description }),
    ...(logo && { logo, image: logo }),
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(priceRange && { priceRange }),
  };

  // Address
  if (address?.city || address?.district || address?.addressText) {
    data.address = {
      "@type": "PostalAddress",
      ...(address.addressText && { streetAddress: address.addressText }),
      ...(address.district && { addressLocality: address.district }),
      ...(address.city && { addressRegion: address.city }),
      addressCountry: "TR",
    };
  }

  // Aggregate Rating
  if (rating && rating.ratingValue > 0 && rating.reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.ratingValue.toFixed(1),
      reviewCount: rating.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Images
  if (images && images.length > 0) {
    data.image = images;
  }

  // Service Area
  if (serviceArea && serviceArea.length > 0) {
    data.areaServed = serviceArea.map((area) => ({
      "@type": "City",
      name: area,
    }));
  }

  return <JsonLd data={data} />;
}
