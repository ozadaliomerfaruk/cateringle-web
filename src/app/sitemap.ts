import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BASE_URL = "https://cateringle.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Onaylı vendor'ları çek
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select("slug, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  // Kategorileri çek
  const { data: categories } = await supabaseAdmin
    .from("service_categories")
    .select("slug")
    .eq("is_active", true);

  // Şehirleri çek
  const { data: cities } = await supabaseAdmin
    .from("cities")
    .select("slug")
    .not("slug", "is", null);

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/vendors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/vendors?segment=kurumsal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vendors?segment=bireysel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Vendor sayfaları
  const vendorPages: MetadataRoute.Sitemap =
    vendors?.map((vendor) => ({
      url: `${BASE_URL}/vendors/${vendor.slug}`,
      lastModified: new Date(vendor.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Kategori sayfaları
  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${BASE_URL}/vendors?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) || [];

  // Şehir sayfaları
  const cityPages: MetadataRoute.Sitemap =
    cities?.map((city) => ({
      url: `${BASE_URL}/vendors?city=${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })) || [];

  return [...staticPages, ...vendorPages, ...categoryPages, ...cityPages];
}
