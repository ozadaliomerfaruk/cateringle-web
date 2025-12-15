// src/components/seo/JsonLd.tsx

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * JSON-LD Structured Data component
 * Google Rich Results için schema.org verileri
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
