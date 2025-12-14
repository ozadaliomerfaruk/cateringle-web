// src/lib/cache.ts
import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Cache süreleri (saniye)
const CACHE_TTL = {
  LOOKUPS: 3600, // 1 saat - cities, categories, vb.
  VENDORS: 300, // 5 dakika - vendor listesi
  STATIC: 86400, // 24 saat - nadiren değişen veriler
};

// Cache tag'leri
export const CACHE_TAGS = {
  CITIES: "cities",
  DISTRICTS: "districts",
  CATEGORIES: "categories",
  SEGMENTS: "segments",
  CUISINES: "cuisines",
  DELIVERY_MODELS: "delivery-models",
  TAGS: "tags",
  TAG_GROUPS: "tag-groups",
  SERVICES: "services",
  SERVICE_GROUPS: "service-groups",
  POPULAR_FILTERS: "popular-filters",
  VENDORS: "vendors",
};

// ============================================
// Cached Lookup Functions
// ============================================

/**
 * Şehirleri cache'li olarak getir
 */
export const getCachedCities = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("cities")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("getCachedCities error:", error);
      return [];
    }
    return data || [];
  },
  ["cities"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.CITIES] }
);

/**
 * İlçeleri şehre göre cache'li olarak getir
 */
export const getCachedDistricts = unstable_cache(
  async (cityId: number) => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", cityId)
      .order("name");

    if (error) {
      console.error("getCachedDistricts error:", error);
      return [];
    }
    return data || [];
  },
  ["districts"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.DISTRICTS] }
);

/**
 * Segmentleri cache'li olarak getir
 */
export const getCachedSegments = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("customer_segments")
      .select("id, name, slug, description")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedSegments error:", error);
      return [];
    }
    return data || [];
  },
  ["segments"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.SEGMENTS] }
);

/**
 * Kategorileri cache'li olarak getir
 */
export const getCachedCategories = unstable_cache(
  async (segmentId?: number) => {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("service_categories")
      .select("id, name, slug, icon, segment_id")
      .eq("is_active", true)
      .order("sort_order");

    if (segmentId) {
      query = query.eq("segment_id", segmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getCachedCategories error:", error);
      return [];
    }
    return data || [];
  },
  ["categories"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.CATEGORIES] }
);

/**
 * Mutfak türlerini cache'li olarak getir
 */
export const getCachedCuisineTypes = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("cuisine_types")
      .select("id, name, slug, category, icon")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedCuisineTypes error:", error);
      return [];
    }
    return data || [];
  },
  ["cuisine-types"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.CUISINES] }
);

/**
 * Teslimat modellerini cache'li olarak getir
 */
export const getCachedDeliveryModels = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("delivery_models")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedDeliveryModels error:", error);
      return [];
    }
    return data || [];
  },
  ["delivery-models"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.DELIVERY_MODELS] }
);

/**
 * Tag gruplarını cache'li olarak getir
 */
export const getCachedTagGroups = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("tag_groups")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedTagGroups error:", error);
      return [];
    }
    return data || [];
  },
  ["tag-groups"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.TAG_GROUPS] }
);

/**
 * Tag'leri cache'li olarak getir
 */
export const getCachedTags = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, slug, group_id, icon")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedTags error:", error);
      return [];
    }
    return data || [];
  },
  ["tags"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.TAGS] }
);

/**
 * Hizmet gruplarını cache'li olarak getir
 */
export const getCachedServiceGroups = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("service_groups")
      .select(`id, name, icon, services (id, name, slug, sort_order)`)
      .order("sort_order");

    if (error) {
      console.error("getCachedServiceGroups error:", error);
      return [];
    }

    // Services'ı sort_order'a göre sırala
    return (data || []).map((group) => ({
      ...group,
      services:
        (group.services as { id: number; name: string; slug: string; sort_order: number | null }[])?.sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        ) || [],
    }));
  },
  ["service-groups"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.SERVICE_GROUPS] }
);

/**
 * Popüler filtreleri cache'li olarak getir
 */
export const getCachedPopularFilters = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("popular_filters")
      .select("id, filter_type, filter_key, label, icon, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("getCachedPopularFilters error:", error);
      return [];
    }
    return data || [];
  },
  ["popular-filters"],
  { revalidate: CACHE_TTL.LOOKUPS, tags: [CACHE_TAGS.POPULAR_FILTERS] }
);

// ============================================
// Cache Invalidation Helpers
// ============================================

import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Belirli bir cache tag'ini invalidate et
 */
export function invalidateCacheTag(tag: string) {
  revalidateTag(tag);
}

/**
 * Tüm lookup cache'lerini invalidate et
 */
export function invalidateAllLookups() {
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });
}

/**
 * Vendor ile ilgili cache'leri invalidate et
 */
export function invalidateVendorCache() {
  revalidateTag(CACHE_TAGS.VENDORS);
  revalidatePath("/vendors");
}

/**
 * Admin panel'den bir lookup güncellendiğinde çağrılacak
 */
export function invalidateLookupCache(
  type:
    | "cities"
    | "districts"
    | "categories"
    | "segments"
    | "cuisines"
    | "delivery_models"
    | "tags"
    | "services"
    | "popular_filters"
) {
  const tagMap: Record<string, string> = {
    cities: CACHE_TAGS.CITIES,
    districts: CACHE_TAGS.DISTRICTS,
    categories: CACHE_TAGS.CATEGORIES,
    segments: CACHE_TAGS.SEGMENTS,
    cuisines: CACHE_TAGS.CUISINES,
    delivery_models: CACHE_TAGS.DELIVERY_MODELS,
    tags: CACHE_TAGS.TAGS,
    services: CACHE_TAGS.SERVICE_GROUPS,
    popular_filters: CACHE_TAGS.POPULAR_FILTERS,
  };

  const tag = tagMap[type];
  if (tag) {
    revalidateTag(tag);
  }

  // Vendors sayfasını da revalidate et
  revalidatePath("/vendors");
}
