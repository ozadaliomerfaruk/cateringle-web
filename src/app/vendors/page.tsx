// src/app/vendors/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FilterSidebar from "./FilterSidebar";
import MobileFilterButton from "./MobileFilterButton";
import VendorCard from "./VendorCard";
import { Tables } from "@/types/database";
import {
  Buildings,
  Confetti,
  ForkKnife,
  Faders,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";

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

  const { data: vendors, error } = await query;

  // Debug log
  console.log("Vendors query result:", { count: vendors?.length, error });

  let filteredVendors = (vendors as unknown as VendorWithRelations[]) || [];

  // Segment filtresi
  if (selectedSegment) {
    filteredVendors = filteredVendors.filter((v) =>
      v.vendor_segments?.some((vs) => vs.segment_id === selectedSegment.id)
    );
  }

  // Kategori filtresi
  if (params.category && categories) {
    const selectedCategory = categories.find((c) => c.slug === params.category);
    if (selectedCategory) {
      filteredVendors = filteredVendors.filter((v) =>
        v.vendor_categories?.some(
          (vc) => vc.category_id === selectedCategory.id
        )
      );
    }
  }

  // Şehir filtresi
  if (params.city) {
    const cityId = parseInt(params.city);
    filteredVendors = filteredVendors.filter((v) => {
      const hasMainCity =
        cities?.find((c) => c.name === v.city?.name)?.id === cityId;
      const hasServiceArea = v.vendor_service_areas?.some(
        (area) => area.city_id === cityId
      );
      return hasMainCity || hasServiceArea;
    });
  }

  // İlçe filtresi
  if (params.district) {
    const districtId = parseInt(params.district);
    filteredVendors = filteredVendors.filter((v) => {
      const hasMainDistrict =
        districts?.find((d) => d.name === v.district?.name)?.id === districtId;
      const hasServiceArea = v.vendor_service_areas?.some(
        (area) => area.district_id === districtId
      );
      return hasMainDistrict || hasServiceArea;
    });
  }

  // Hizmet filtresi
  if (params.services) {
    const serviceSlugList = params.services.split(",");
    filteredVendors = filteredVendors.filter((v) =>
      serviceSlugList.every((slug) =>
        v.vendor_services?.some((vs) => vs.service?.slug === slug)
      )
    );
  }

  // Mutfak türü filtresi
  if (params.cuisines) {
    const cuisineIdList = params.cuisines.split(",").map(Number);
    filteredVendors = filteredVendors.filter((v) =>
      cuisineIdList.some((id) =>
        v.vendor_cuisines?.some((vc) => vc.cuisine_type_id === id)
      )
    );
  }

  // Teslimat modeli filtresi
  if (params.delivery_models) {
    const deliveryModelIdList = params.delivery_models.split(",").map(Number);
    filteredVendors = filteredVendors.filter((v) =>
      deliveryModelIdList.some((id) =>
        v.vendor_delivery_models?.some((vdm) => vdm.delivery_model_id === id)
      )
    );
  }

  // Tag filtresi
  if (params.tags) {
    const tagIdList = params.tags.split(",").map(Number);
    filteredVendors = filteredVendors.filter((v) =>
      tagIdList.some((id) => v.vendor_tags?.some((vt) => vt.tag_id === id))
    );
  }

  // Lead time filtresi
  if (params.lead_time) {
    const leadTimeList = params.lead_time.split(",");
    if (leadTimeList.length > 0) {
      filteredVendors = filteredVendors.filter(
        (v) => v.lead_time_type && leadTimeList.includes(v.lead_time_type)
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
                {filteredVendors.length} firma bulundu
              </p>
            </div>

            {filteredVendors.length === 0 ? (
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
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
