import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cateringle.com";

  // Onaylı vendor'ları çek
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select("slug, updated_at")
    .eq("status", "approved");

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Vendor sayfaları
  const vendorPages: MetadataRoute.Sitemap =
    vendors?.map((vendor) => ({
      url: `${baseUrl}/vendors/${vendor.slug}`,
      lastModified: new Date(vendor.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  return [...staticPages, ...vendorPages];
}
