// src/app/vendors/page.tsx
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FavoriteButton from "../../components/FavoriteButton";
import FilterSidebar from "./FilterSidebar";
import MobileFilterButton from "./MobileFilterButton";
import { Tables } from "@/types/database";
import CategoryFilter from "@/components/CategoryFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catering Firmaları",
  description:
    "Türkiye'nin en iyi catering firmalarını keşfedin. Düğün, nişan, kurumsal etkinlik için uygun firmayı bulun.",
};

interface VendorsPageProps {
  searchParams: Promise<{
    city?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    min_guest?: string;
    max_guest?: string;
    category?: string;
    services?: string;
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

interface VendorWithRelations extends Vendor {
  city: Pick<City, "name"> | null;
  district: Pick<District, "name"> | null;
  vendor_categories: { category_id: number }[];
  vendor_services: { service_id: number; service: { slug: string } | null }[];
  vendor_ratings:
    | { avg_rating: number | null; review_count: number | null }[]
    | null;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  // Kategorileri çek
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("sort_order");

  // Hizmet gruplarını çek
  const { data: serviceGroups } = await supabase
    .from("service_groups")
    .select(
      `
      id, name, icon,
      services (id, name, slug, sort_order)
    `
    )
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

  // Seçili şehrin ilçelerini çek
  let districts: { id: number; name: string }[] = [];
  if (params.city) {
    const { data: districtData } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", parseInt(params.city))
      .order("name");
    districts = districtData || [];
  }

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
      city:cities(name),
      district:districts(name),
      vendor_categories(category_id),
      vendor_services(service_id, service:services(slug)),
      vendor_ratings(avg_rating, review_count)
    `
    )
    .eq("status", "approved");

  // Filtreler
  if (params.city) query = query.eq("city_id", parseInt(params.city));
  if (params.district)
    query = query.eq("district_id", parseInt(params.district));
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

  // Kategori filtresi
  let filteredVendors = (vendors || []) as unknown as VendorWithRelations[];
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

  // Aktif filtre sayısı
  const activeFilterCount = [
    params.city,
    params.district,
    params.min_price,
    params.max_price,
    params.min_guest,
    params.max_guest,
    params.services,
  ].filter(Boolean).length;

  // Seçili kategori adı
  const selectedCategory = categories?.find((c) => c.slug === params.category);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {selectedCategory ? (
                  <>{selectedCategory.name} Catering</>
                ) : (
                  "Catering Firmaları"
                )}
              </h1>
              <p className="mt-1 text-slate-600">
                {filteredVendors.length === 0
                  ? "Sonuç bulunamadı"
                  : filteredVendors.length === 1
                  ? "1 firma bulundu"
                  : `${filteredVendors.length} firma bulundu`}
              </p>
            </div>
            {activeFilterCount > 0 && (
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Filtreleri Temizle ({activeFilterCount})
              </Link>
            )}
          </div>

          {/* Kategori Pills */}
          <div className="mt-6">
            <CategoryFilter
              categories={categories || []}
              currentCategory={params.category}
              currentParams={params}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar
                cities={cities || []}
                districts={districts}
                serviceGroups={sortedServiceGroups}
                currentParams={params}
              />
            </div>
          </aside>

          {/* Vendor Grid */}
          <div className="flex-1">
            {filteredVendors.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Aramanızla eşleşen firma bulamadık
                </h3>
                <p className="mt-2 text-slate-500">
                  Farklı filtreler deneyerek veya tüm firmalara göz atarak
                  aradığınızı bulabilirsiniz.
                </p>
                <Link
                  href="/vendors"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Filtreleri Temizle
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVendors.map((vendor) => {
                  const rating = vendor.vendor_ratings?.[0];
                  const hasRating = rating?.avg_rating && rating.avg_rating > 0;

                  return (
                    <div
                      key={vendor.id}
                      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Favori Butonu */}
                      <div className="absolute right-3 top-3 z-10">
                        <FavoriteButton vendorId={vendor.id} size="sm" />
                      </div>

                      <Link href={`/vendors/${vendor.slug}`}>
                        {/* Görsel Alanı */}
                        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                          {vendor.logo_url ? (
                            <div className="relative h-full w-full">
                              <Image
                                src={vendor.logo_url}
                                alt={vendor.business_name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <svg
                                className="h-16 w-16 text-emerald-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* İçerik */}
                        <div className="p-5">
                          {/* Başlık ve Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
                              {vendor.business_name}
                            </h2>
                            {hasRating && (
                              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                                <svg
                                  className="h-4 w-4 text-amber-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-semibold text-amber-700">
                                  {Number(rating.avg_rating).toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Konum */}
                          {(vendor.city?.name || vendor.district?.name) && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                              <svg
                                className="h-4 w-4 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {[vendor.district?.name, vendor.city?.name]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}

                          {/* Açıklama */}
                          {vendor.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                              {vendor.description}
                            </p>
                          )}

                          {/* Bilgiler */}
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {typeof vendor.avg_price_per_person ===
                              "number" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {Math.round(vendor.avg_price_per_person)}{" "}
                                TL/kişi
                              </span>
                            )}
                            {vendor.min_guest_count &&
                              vendor.max_guest_count && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  {vendor.min_guest_count}-
                                  {vendor.max_guest_count} kişi
                                </span>
                              )}
                            {hasRating &&
                              rating.review_count &&
                              rating.review_count > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                  {rating.review_count} yorum
                                </span>
                              )}
                          </div>

                          {/* CTA */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-medium text-emerald-600 transition-colors group-hover:text-emerald-700">
                              İncele ve Teklif Al
                            </span>
                            <svg
                              className="h-5 w-5 text-emerald-600 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
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
          currentParams={params}
        />
      </MobileFilterButton>
    </main>
  );
}
