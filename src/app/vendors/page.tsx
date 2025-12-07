// src/app/vendors/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FilterSidebar from "./FilterSidebar";
import MobileFilterButton from "./MobileFilterButton";
import VendorCard from "./VendorCard";
import { Tables } from "@/types/database";

export const dynamic = "force-dynamic";

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
  }>;
}

type Vendor = Tables<"vendors">;
type City = Tables<"cities">;
type District = Tables<"districts">;

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

interface VendorWithRelations
  extends Omit<
    Vendor,
    | "available_24_7"
    | "has_refrigerated_vehicle"
    | "serves_outside_city"
    | "halal_certified"
    | "free_tasting"
    | "free_delivery"
    | "accepts_last_minute"
    | "city_id"
    | "district_id"
  > {
  city: Pick<City, "name"> | null;
  district: Pick<District, "name"> | null;
  vendor_categories: { category_id: number }[];
  vendor_services: { service_id: number; service: { slug: string } | null }[];
  vendor_segments: { segment_id: number }[];
  vendor_ratings:
    | { avg_rating: number | null; review_count: number | null }[]
    | null;
  vendor_cuisines?: { cuisine_type_id: number }[];
  vendor_delivery_models?: { delivery_model_id: number }[];
  vendor_tags?: { tag_id: number }[];
  vendor_service_areas?: {
    city_id: number | null;
    district_id: number | null;
  }[];
  // Boolean alanlar
  available_24_7?: boolean | null;
  has_refrigerated_vehicle?: boolean | null;
  serves_outside_city?: boolean | null;
  halal_certified?: boolean | null;
  free_tasting?: boolean | null;
  free_delivery?: boolean | null;
  accepts_last_minute?: boolean | null;
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

export async function generateMetadata({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const segment = params.segment;

  if (segment && segmentInfo[segment]) {
    return {
      title: segmentInfo[segment].title,
      description: segmentInfo[segment].description,
    };
  }

  return {
    title: "Catering Firmaları",
    description: "Türkiye'nin en iyi catering firmalarını keşfedin.",
  };
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

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

  // Vendor sorgusu
  let query = supabase
    .from("vendors")
    .select(
      `
      id,
      business_name,
      slug,
      description,
      logo_url,
      avg_price_per_person,
      min_guest_count,
      max_guest_count,
      lead_time_type,
      available_24_7,
      has_refrigerated_vehicle,
      serves_outside_city,
      halal_certified,
      free_tasting,
      free_delivery,
      accepts_last_minute,
      city:cities(name),
      district:districts(name),
      vendor_categories(category_id),
      vendor_services(service_id, service:services(slug)),
      vendor_segments(segment_id),
      vendor_ratings(avg_rating, review_count),
      vendor_cuisines(cuisine_type_id),
      vendor_delivery_models(delivery_model_id),
      vendor_tags(tag_id),
      vendor_service_areas(city_id, district_id)
    `
    )
    .eq("status", "approved");

  // Fiyat ve kisi sayisi filtreleri (bunlar vendor uzerinden)
  if (params.min_price)
    query = query.gte("avg_price_per_person", parseFloat(params.min_price));
  if (params.max_price)
    query = query.lte("avg_price_per_person", parseFloat(params.max_price));
  if (params.min_guest)
    query = query.gte("max_guest_count", parseInt(params.min_guest));
  if (params.max_guest)
    query = query.lte("min_guest_count", parseInt(params.max_guest));

  const { data: vendors } = await query.order("created_at", {
    ascending: false,
  });

  // Vendor'ları filtrele
  let filteredVendors = (vendors || []) as unknown as VendorWithRelations[];

  // Segment filtresi
  if (selectedSegment) {
    filteredVendors = filteredVendors.filter((v) =>
      v.vendor_segments?.some((vs) => vs.segment_id === selectedSegment.id)
    );
  }

  // Hizmet bolgesi filtresi (vendor_service_areas uzerinden)
  if (params.city) {
    const cityId = parseInt(params.city);
    filteredVendors = filteredVendors.filter((v) => {
      // Firma bu sehire hizmet veriyor mu?
      const servesCity = v.vendor_service_areas?.some(
        (area) => area.city_id === cityId && area.district_id === null
      );
      // Veya bu sehirdeki herhangi bir ilceye hizmet veriyor mu?
      const servesDistrictInCity = v.vendor_service_areas?.some(
        (area) => area.city_id === cityId && area.district_id !== null
      );
      return servesCity || servesDistrictInCity;
    });

    // Ilce filtresi (sadece sehir seciliyse)
    if (params.district) {
      const districtId = parseInt(params.district);
      filteredVendors = filteredVendors.filter((v) => {
        // Firma bu ilceye ozel hizmet veriyor mu?
        const servesDistrict = v.vendor_service_areas?.some(
          (area) => area.district_id === districtId
        );
        // Veya tum sehire hizmet veriyor mu? (district_id null ise tum sehir)
        const servesWholeCity = v.vendor_service_areas?.some(
          (area) => area.city_id === cityId && area.district_id === null
        );
        return servesDistrict || servesWholeCity;
      });
    }
  }

  // Kategori filtresi
  if (params.category) {
    const categoryObj = categories?.find((c) => c.slug === params.category);
    if (categoryObj) {
      filteredVendors = filteredVendors.filter((v) =>
        v.vendor_categories?.some((vc) => vc.category_id === categoryObj.id)
      );
    }
  }

  // Hizmet filtresi
  if (params.services) {
    const serviceSlugs = params.services.split(",");
    filteredVendors = filteredVendors.filter((v) =>
      v.vendor_services?.some((vs) =>
        serviceSlugs.includes(vs.service?.slug || "")
      )
    );
  }

  // Mutfak türü filtresi
  if (params.cuisines) {
    const cuisineSlugs = params.cuisines.split(",");
    const cuisineIds =
      cuisineTypes
        ?.filter((c) => cuisineSlugs.includes(c.slug))
        .map((c) => c.id) || [];
    if (cuisineIds.length > 0) {
      filteredVendors = filteredVendors.filter((v) =>
        v.vendor_cuisines?.some((vc) => cuisineIds.includes(vc.cuisine_type_id))
      );
    }
  }

  // Teslimat modeli filtresi
  if (params.delivery_models) {
    const modelSlugs = params.delivery_models.split(",");
    const modelIds =
      deliveryModels
        ?.filter((m) => modelSlugs.includes(m.slug))
        .map((m) => m.id) || [];
    if (modelIds.length > 0) {
      filteredVendors = filteredVendors.filter((v) =>
        v.vendor_delivery_models?.some((vdm) =>
          modelIds.includes(vdm.delivery_model_id)
        )
      );
    }
  }

  // Etiket filtresi
  if (params.tags) {
    const tagSlugs = params.tags.split(",");
    const tagIds =
      tags?.filter((t) => tagSlugs.includes(t.slug)).map((t) => t.id) || [];
    if (tagIds.length > 0) {
      filteredVendors = filteredVendors.filter((v) =>
        v.vendor_tags?.some((vt) => tagIds.includes(vt.tag_id))
      );
    }
  }

  // Boolean filtreler
  if (params.available_24_7 === "true") {
    filteredVendors = filteredVendors.filter((v) => v.available_24_7 === true);
  }
  if (params.has_refrigerated === "true") {
    filteredVendors = filteredVendors.filter(
      (v) => v.has_refrigerated_vehicle === true
    );
  }
  if (params.serves_outside_city === "true") {
    filteredVendors = filteredVendors.filter(
      (v) => v.serves_outside_city === true
    );
  }
  if (params.halal_certified === "true") {
    filteredVendors = filteredVendors.filter((v) => v.halal_certified === true);
  }
  if (params.free_tasting === "true") {
    filteredVendors = filteredVendors.filter((v) => v.free_tasting === true);
  }
  if (params.free_delivery === "true") {
    filteredVendors = filteredVendors.filter((v) => v.free_delivery === true);
  }
  if (params.accepts_last_minute === "true") {
    filteredVendors = filteredVendors.filter(
      (v) => v.accepts_last_minute === true
    );
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

  const selectedCategory = categories?.find((c) => c.slug === params.category);

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries({ ...params, ...newParams }).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
      else urlParams.delete(key);
    });
    const queryString = urlParams.toString();
    return queryString ? `/vendors?${queryString}` : "/vendors";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Breadcrumb + Sonuç Sayısı */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-blue-600 hover:underline">
                Ana Sayfa
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">Catering Firmaları</span>
              {selectedSegment && (
                <>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-900 font-medium">
                    {selectedSegment.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Segment Tabs */}
          <div className="mt-4 flex items-center gap-6 border-b border-slate-200 -mb-[1px]">
            <Link
              href="/vendors"
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                !params.segment
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü
            </Link>
            {segments?.map((segment) => (
              <Link
                key={segment.id}
                href={buildUrl({ segment: segment.slug, category: undefined })}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  params.segment === segment.slug
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {segment.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Kategori Chips */}
      {categories && categories.length > 0 && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href={buildUrl({ category: undefined })}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !params.category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    params.category === category.slug
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Sonuç Başlığı */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {selectedCategory
              ? `${selectedCategory.name} Catering`
              : "Catering Firmaları"}
            {params.city &&
              cities?.find((c) => c.id === parseInt(params.city!))?.name &&
              ` - ${cities.find((c) => c.id === parseInt(params.city!))?.name}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredVendors.length} firma bulundu
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-4">
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

          {/* Vendor Listesi */}
          <div className="flex-1">
            {filteredVendors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Firma bulunamadı
                </h3>
                <p className="mt-2 text-slate-600">
                  Arama kriterlerinize uygun firma bulunamadı.
                </p>
                <Link
                  href="/vendors"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Filtreleri Temizle
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
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
