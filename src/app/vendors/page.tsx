// src/app/vendors/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FilterSidebar from "./FilterSidebar";
import MobileFilterButton from "./MobileFilterButton";
import VendorCard from "./VendorCard";
import {
  Buildings,
  Confetti,
  ForkKnife,
  Faders,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

const BASE_URL = "https://cateringle.com";

interface VendorsPageProps {
  searchParams: Promise<{
    city?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    min_guest?: string;
    max_guest?: string;
    category?: string;
    segment?: string;
    services?: string;
    cuisines?: string;
    delivery_models?: string;
    tags?: string;
    lead_time?: string;
    available_24_7?: string;
    has_refrigerated?: string;
    serves_outside_city?: string;
    halal_certified?: string;
    free_tasting?: string;
    free_delivery?: string;
    accepts_last_minute?: string;
    page?: string;
    sort?: string;
    q?: string;
  }>;
}

interface ServiceGroup {
  id: number;
  name: string;
  icon: string | null;
  services: {
    id: number;
    name: string;
    slug: string;
    sort_order: number | null;
  }[];
}

// RPC'den dönen vendor tipi
interface VendorImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface SearchVendor {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  avg_price_per_person: number | null;
  min_guest_count: number | null;
  max_guest_count: number | null;
  lead_time_type: string | null;
  available_24_7: boolean;
  has_refrigerated_vehicle: boolean;
  serves_outside_city: boolean;
  halal_certified: boolean;
  free_tasting: boolean;
  free_delivery: boolean;
  accepts_last_minute: boolean;
  city_name: string | null;
  district_name: string | null;
  avg_rating: number;
  review_count: number;
  images: VendorImage[];
}

interface SearchResult {
  vendors: SearchVendor[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const segmentInfo: Record<string, { title: string; description: string }> = {
  kurumsal: {
    title: "Kurumsal Catering Firmaları",
    description:
      "Ofis yemekleri, toplantı ikramları ve kurumsal etkinlikler için profesyonel catering hizmetleri",
  },
  bireysel: {
    title: "Bireysel Catering Firmaları",
    description:
      "Düğün, doğum günü, ev partisi ve özel günleriniz için catering hizmetleri",
  },
};

export async function generateMetadata({
  searchParams,
}: VendorsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const segment = params.segment;

  const title =
    segment && segmentInfo[segment]
      ? `${segmentInfo[segment].title} | Cateringle.com`
      : "Catering Firmaları | Cateringle.com";

  const description =
    segment && segmentInfo[segment]
      ? segmentInfo[segment].description
      : "En iyi catering firmalarını keşfedin. Düğün, kurumsal etkinlik, doğum günü ve daha fazlası için fiyat teklifi alın.";

  const url = segment
    ? `${BASE_URL}/vendors?segment=${segment}`
    : `${BASE_URL}/vendors`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Cateringle.com",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Cateringle - Catering Firmaları",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  // Sayfa numarası
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 12;

  // Segmentleri çek
  const { data: segments } = await supabase
    .from("customer_segments")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("sort_order");

  const selectedSegment = segments?.find((s) => s.slug === params.segment);

  // Kategorileri çek
  let categoriesQuery = supabase
    .from("service_categories")
    .select("id, name, slug, icon, segment_id")
    .eq("is_active", true)
    .order("sort_order");

  if (selectedSegment) {
    categoriesQuery = categoriesQuery.eq("segment_id", selectedSegment.id);
  }

  const { data: categories } = await categoriesQuery;

  // Seçili kategori
  const selectedCategory = categories?.find((c) => c.slug === params.category);

  // Hizmet gruplarını çek
  const { data: serviceGroups } = await supabase
    .from("service_groups")
    .select(`id, name, icon, services (id, name, slug, sort_order)`)
    .order("sort_order");

  const sortedServiceGroups: ServiceGroup[] =
    serviceGroups?.map((g) => {
      const group = g as unknown as ServiceGroup;
      return {
        ...group,
        services:
          group.services?.sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          ) || [],
      };
    }) || [];

  // Şehirleri çek
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  // İlçeleri çek
  let districts: { id: number; name: string }[] = [];
  if (params.city) {
    const { data: districtData } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", parseInt(params.city))
      .order("name");
    districts = districtData || [];
  }

  // Mutfak Türleri
  const { data: cuisineTypes } = await supabase
    .from("cuisine_types")
    .select("id, name, slug, category, icon")
    .eq("is_active", true)
    .order("sort_order");

  // Teslimat Modelleri
  const { data: deliveryModels } = await supabase
    .from("delivery_models")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("sort_order");

  // Etiket Grupları ve Etiketler
  const { data: tagGroups } = await supabase
    .from("tag_groups")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("sort_order");

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug, group_id, icon")
    .eq("is_active", true)
    .order("sort_order");

  // Populer Filtreler
  const { data: popularFilters } = await supabase
    .from("popular_filters")
    .select("id, filter_type, filter_key, label, icon, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  // Service slug'larını ID'lere çevir
  let serviceIds: number[] | null = null;
  if (params.services) {
    const serviceSlugs = params.services.split(",");
    const allServices = sortedServiceGroups.flatMap((g) => g.services);
    serviceIds = serviceSlugs
      .map((slug) => allServices.find((s) => s.slug === slug)?.id)
      .filter((id): id is number => id !== undefined);
    if (serviceIds.length === 0) serviceIds = null;
  }

  // RPC parametrelerini hazırla
  const rpcParams = {
    p_segment_id: selectedSegment?.id || null,
    p_category_id: selectedCategory?.id || null,
    p_city_id: params.city ? parseInt(params.city) : null,
    p_district_id: params.district ? parseInt(params.district) : null,
    p_min_price: params.min_price ? parseFloat(params.min_price) : null,
    p_max_price: params.max_price ? parseFloat(params.max_price) : null,
    p_min_guest: params.min_guest ? parseInt(params.min_guest) : null,
    p_max_guest: params.max_guest ? parseInt(params.max_guest) : null,
    p_service_ids: serviceIds,
    p_cuisine_ids: params.cuisines
      ? params.cuisines.split(",").map(Number)
      : null,
    p_delivery_model_ids: params.delivery_models
      ? params.delivery_models.split(",").map(Number)
      : null,
    p_tag_ids: params.tags ? params.tags.split(",").map(Number) : null,
    p_lead_time_types: params.lead_time ? params.lead_time.split(",") : null,
    p_available_24_7: params.available_24_7 === "true" ? true : null,
    p_has_refrigerated: params.has_refrigerated === "true" ? true : null,
    p_serves_outside_city: params.serves_outside_city === "true" ? true : null,
    p_halal_certified: params.halal_certified === "true" ? true : null,
    p_free_tasting: params.free_tasting === "true" ? true : null,
    p_free_delivery: params.free_delivery === "true" ? true : null,
    p_accepts_last_minute: params.accepts_last_minute === "true" ? true : null,
    p_page: currentPage,
    p_page_size: pageSize,
    p_sort_by: params.sort || "rating",
    p_search_query: params.q || null,
  };

  // search_vendors RPC çağrısı
  const { data: searchResult, error } = await supabase.rpc(
    "search_vendors",
    rpcParams
  );

  // Sonuçları parse et
  const result: SearchResult = (searchResult as unknown as SearchResult) || {
    vendors: [],
    total_count: 0,
    page: 1,
    page_size: pageSize,
    total_pages: 0,
  };

  if (error) {
    console.error("search_vendors error:", error);
  }

  // Aktif filtre sayısı
  const activeFilterCount = [
    params.city,
    params.district,
    params.min_price,
    params.max_price,
    params.min_guest,
    params.max_guest,
    params.services,
    params.cuisines,
    params.delivery_models,
    params.tags,
    params.available_24_7,
    params.has_refrigerated,
    params.serves_outside_city,
    params.halal_certified,
    params.free_tasting,
    params.free_delivery,
    params.accepts_last_minute,
  ].filter(Boolean).length;

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    // page parametresini sıfırla (filtre değiştiğinde)
    const resetPage = Object.keys(newParams).some((k) => k !== "page");

    Object.entries({ ...params, ...newParams }).forEach(([key, value]) => {
      if (key === "page" && resetPage && !newParams.page) return;
      if (value) urlParams.set(key, value);
      else urlParams.delete(key);
    });
    const queryString = urlParams.toString();
    return queryString ? `/vendors?${queryString}` : "/vendors";
  };

  // Pagination helper
  const buildPageUrl = (page: number) => {
    return buildUrl({ page: page.toString() });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Segment Tabs - Airbnb Style */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white lg:top-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex items-center gap-6 py-4">
            {/* Segment Pills */}
            <div className="flex items-center gap-2">
              <Link
                href="/vendors"
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !params.segment
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ForkKnife size={18} weight="light" />
                Tümü
              </Link>
              <Link
                href={buildUrl({ segment: "kurumsal", category: undefined })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  params.segment === "kurumsal"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Buildings size={18} weight="light" />
                Kurumsal
              </Link>
              <Link
                href={buildUrl({ segment: "bireysel", category: undefined })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  params.segment === "bireysel"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Confetti size={18} weight="light" />
                Bireysel
              </Link>
            </div>

            {/* Separator */}
            <div className="hidden h-8 w-px bg-slate-200 lg:block" />

            {/* Kategori Chips */}
            {categories && categories.length > 0 && (
              <div className="hidden flex-1 gap-2 overflow-x-auto lg:flex">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={buildUrl({
                      category: category.slug,
                      segment:
                        params.segment ||
                        (category.segment_id === 1 ? "kurumsal" : "bireysel"),
                    })}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      params.category === category.slug
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Filtre Butonu (Desktop) */}
            <button className="ml-auto hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-900 lg:flex">
              <Faders size={18} weight="light" />
              Filtreler
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Kategori Chips */}
      {categories && categories.length > 0 && (
        <div className="border-b border-slate-100 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3">
              <Link
                href={buildUrl({ category: undefined })}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  !params.category
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Tümü
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildUrl({
                    category: category.slug,
                    segment:
                      params.segment ||
                      (category.segment_id === 1 ? "kurumsal" : "bireysel"),
                  })}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                    params.category === category.slug
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-40">
              <FilterSidebar
                cities={cities || []}
                districts={districts}
                serviceGroups={sortedServiceGroups}
                cuisineTypes={cuisineTypes || []}
                deliveryModels={deliveryModels || []}
                tagGroups={tagGroups || []}
                tags={tags || []}
                popularFilters={popularFilters || []}
                currentParams={params}
              />
            </div>
          </aside>

          {/* Vendor Grid */}
          <div className="flex-1">
            {/* Sonuç Başlığı */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedCategory
                  ? selectedCategory.name
                  : selectedSegment
                  ? selectedSegment.name
                  : "Tüm Catering Firmaları"}
              </h1>
              <p className="mt-1 text-slate-500">
                {result.total_count} firma bulundu
                {result.total_pages > 1 && (
                  <span className="text-slate-400">
                    {" "}
                    · Sayfa {result.page}/{result.total_pages}
                  </span>
                )}
              </p>
            </div>

            {result.vendors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <MagnifyingGlass
                    size={32}
                    weight="light"
                    className="text-slate-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Firma bulunamadı
                </h3>
                <p className="mt-2 text-slate-600">
                  Arama kriterlerinize uygun firma bulunamadı.
                </p>
                <Link
                  href="/vendors"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Filtreleri Temizle
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {result.vendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={{
                        id: vendor.id,
                        business_name: vendor.business_name,
                        slug: vendor.slug,
                        description: vendor.description,
                        logo_url: vendor.logo_url,
                        avg_price_per_person: vendor.avg_price_per_person,
                        min_guest_count: vendor.min_guest_count,
                        max_guest_count: vendor.max_guest_count,
                        lead_time_type: vendor.lead_time_type,
                        available_24_7: vendor.available_24_7,
                        has_refrigerated_vehicle:
                          vendor.has_refrigerated_vehicle,
                        serves_outside_city: vendor.serves_outside_city,
                        halal_certified: vendor.halal_certified,
                        free_tasting: vendor.free_tasting,
                        free_delivery: vendor.free_delivery,
                        accepts_last_minute: vendor.accepts_last_minute,
                        city: vendor.city_name
                          ? { name: vendor.city_name }
                          : null,
                        district: vendor.district_name
                          ? { name: vendor.district_name }
                          : null,
                        vendor_ratings: [
                          {
                            avg_rating: vendor.avg_rating,
                            review_count: vendor.review_count,
                          },
                        ],
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {result.total_pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {/* Önceki Sayfa */}
                    {currentPage > 1 ? (
                      <Link
                        href={buildPageUrl(currentPage - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                      >
                        <CaretLeft size={20} weight="bold" />
                      </Link>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-300">
                        <CaretLeft size={20} weight="bold" />
                      </span>
                    )}

                    {/* Sayfa Numaraları */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, result.total_pages) },
                        (_, i) => {
                          let pageNum: number;
                          if (result.total_pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= result.total_pages - 2) {
                            pageNum = result.total_pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Link
                              key={pageNum}
                              href={buildPageUrl(pageNum)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                pageNum === currentPage
                                  ? "bg-slate-900 text-white"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </Link>
                          );
                        }
                      )}
                    </div>

                    {/* Sonraki Sayfa */}
                    {currentPage < result.total_pages ? (
                      <Link
                        href={buildPageUrl(currentPage + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                      >
                        <CaretRight size={20} weight="bold" />
                      </Link>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-300">
                        <CaretRight size={20} weight="bold" />
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobil Filtre Butonu */}
      <MobileFilterButton activeFilterCount={activeFilterCount}>
        <FilterSidebar
          cities={cities || []}
          districts={districts}
          serviceGroups={sortedServiceGroups}
          cuisineTypes={cuisineTypes || []}
          deliveryModels={deliveryModels || []}
          tagGroups={tagGroups || []}
          tags={tags || []}
          popularFilters={popularFilters || []}
          currentParams={params}
        />
      </MobileFilterButton>
    </main>
  );
}
