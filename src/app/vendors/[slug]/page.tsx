import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LeadForm from "../../../components/LeadForm";
import ReviewForm from "../../../components/ReviewForm";
import ReviewList from "../../../components/ReviewList";
import FavoriteButton from "../../../components/FavoriteButton";

// Type definitions for nested Supabase queries
type VendorCategory = {
  category: {
    name: string;
    icon: string | null;
  } | null;
};

type VendorService = {
  service: {
    name: string;
    group: {
      icon: string | null;
    } | null;
  } | null;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number | null;
};

type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  menu_items: MenuItem[] | null;
};

type Package = {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number | null;
  min_guest_count: number | null;
  max_guest_count: number | null;
  includes: string[] | null;
};

interface VendorPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("business_name, description, city_id")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!vendor) {
    return { title: "Firma Bulunamadı | Cateringle.com" };
  }

  let cityName = "";
  if (vendor.city_id) {
    const { data: city } = await supabase
      .from("cities")
      .select("name")
      .eq("id", vendor.city_id)
      .maybeSingle();
    cityName = city?.name || "";
  }

  return {
    title: `${vendor.business_name} | Catering Hizmeti${
      cityName ? ` - ${cityName}` : ""
    }`,
    description:
      vendor.description?.slice(0, 155) ||
      `${vendor.business_name} catering hizmetleri.`,
  };
}

export default async function VendorDetailPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select(
      `
      id, business_name, slug, description, logo_url,
      avg_price_per_person, min_guest_count, max_guest_count,
      phone, whatsapp, email, website_url, address_text,
      city_id, district_id, status, created_at
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    notFound();
  }

  // Galeri
  const { data: images } = await supabase
    .from("vendor_images")
    .select("id, image_url")
    .eq("vendor_id", vendor.id)
    .order("sort_order")
    .limit(12);

  // Yorumlar
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, is_verified, created_at")
    .eq("vendor_id", vendor.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // Ortalama puan
  const { data: ratingData } = await supabase
    .from("vendor_ratings")
    .select("avg_rating, review_count")
    .eq("vendor_id", vendor.id)
    .maybeSingle();

  // Menüler
  const { data: menuCategories } = await supabase
    .from("menu_categories")
    .select(
      `id, name, description, menu_items (id, name, description, price_per_person)`
    )
    .eq("vendor_id", vendor.id)
    .order("sort_order");

  // Paketler
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("vendor_id", vendor.id)
    .eq("is_active", true)
    .order("sort_order");

  // Kategoriler
  const { data: vendorCats } = await supabase
    .from("vendor_categories")
    .select("category:service_categories(name, icon)")
    .eq("vendor_id", vendor.id);

  // Hizmetler
  const { data: vendorServices } = await supabase
    .from("vendor_services")
    .select("service:services(name, group:service_groups(icon))")
    .eq("vendor_id", vendor.id);

  // Şehir/İlçe
  let cityName = "";
  let districtName = "";

  if (vendor.city_id) {
    const { data } = await supabase
      .from("cities")
      .select("name")
      .eq("id", vendor.city_id)
      .maybeSingle();
    cityName = data?.name || "";
  }
  if (vendor.district_id) {
    const { data } = await supabase
      .from("districts")
      .select("name")
      .eq("id", vendor.district_id)
      .maybeSingle();
    districtName = data?.name || "";
  }

  const locationText = [districtName, cityName].filter(Boolean).join(", ");
  const whatsappLink = vendor.whatsapp
    ? `https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`
    : null;
  const galleryImages = images || [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-emerald-600">
                  Ana Sayfa
                </Link>
              </li>
              <li>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-emerald-600">
                  Firmalar
                </Link>
              </li>
              <li>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-slate-900 font-medium">
                {vendor.business_name}
              </li>
            </ol>
          </nav>

          {/* Firma Bilgileri */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Logo */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 shadow-sm">
                {vendor.logo_url ? (
                  <Image
                    src={vendor.logo_url}
                    alt={vendor.business_name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-12 w-12 text-emerald-600"
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
                )}
              </div>

              {/* Bilgiler */}
              <div>
                <div className="flex items-start gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {vendor.business_name}
                  </h1>
                  <FavoriteButton vendorId={vendor.id} size="md" />
                </div>

                {locationText && (
                  <p className="mt-2 flex items-center gap-1.5 text-slate-600">
                    <svg
                      className="h-5 w-5 text-slate-400"
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
                    {locationText}
                  </p>
                )}

                {/* Rating */}
                {ratingData?.avg_rating && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(ratingData.avg_rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-200 fill-slate-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {ratingData.avg_rating}
                    </span>
                    <span className="text-slate-500">
                      ({ratingData.review_count} yorum)
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {typeof vendor.avg_price_per_person === "number" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      ≈ {Math.round(vendor.avg_price_per_person)} TL / kişi
                    </span>
                  )}
                  {vendor.min_guest_count && vendor.max_guest_count && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {vendor.min_guest_count} - {vendor.max_guest_count} kişi
                    </span>
                  )}
                </div>

                {/* Kategoriler */}
                {vendorCats && vendorCats.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {vendorCats.map((vc: VendorCategory, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {vc.category?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
                >
                  <svg
                    className="h-5 w-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Ara
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol Kolon */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hakkında */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Firma Hakkında
              </h2>
              {vendor.description ? (
                <p className="mt-4 whitespace-pre-line text-slate-600 leading-relaxed">
                  {vendor.description}
                </p>
              ) : (
                <p className="mt-4 text-slate-500 italic">
                  Firma açıklaması henüz eklenmemiş.
                </p>
              )}
            </section>

            {/* Galeri */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Fotoğraflar
              </h2>
              {galleryImages.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="group aspect-square overflow-hidden rounded-xl bg-slate-100"
                    >
                      <Image
                        src={img.image_url}
                        alt="Firma fotoğrafı"
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex aspect-square items-center justify-center rounded-xl bg-slate-100"
                    >
                      <svg
                        className="h-8 w-8 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Sunulan Hizmetler */}
            {vendorServices && vendorServices.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Sunulan Hizmetler
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {vendorServices.map((vs: VendorService, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
                    >
                      <svg
                        className="h-4 w-4 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {vs.service?.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Menüler */}
            {menuCategories && menuCategories.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Menüler
                </h2>
                <div className="mt-4 space-y-6">
                  {menuCategories.map((category: MenuCategory) => (
                    <div key={category.id}>
                      <h3 className="font-semibold text-slate-900">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        {category.menu_items?.map((item: MenuItem) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-sm text-slate-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.price_per_person && (
                              <span className="text-lg font-semibold text-emerald-600">
                                {item.price_per_person} TL
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Paketler */}
            {packages && packages.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Paketler
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {packages.map((pkg: Package) => (
                    <div
                      key={pkg.id}
                      className="rounded-xl border-2 border-slate-100 bg-linear-to-br from-slate-50 to-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">
                          {pkg.name}
                        </h3>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                          {pkg.price_per_person} TL
                        </span>
                      </div>
                      {pkg.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {pkg.description}
                        </p>
                      )}
                      {pkg.min_guest_count && pkg.max_guest_count && (
                        <p className="mt-2 text-xs text-slate-500">
                          {pkg.min_guest_count} - {pkg.max_guest_count} kişi
                        </p>
                      )}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {pkg.includes.map((item: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <svg
                                className="h-4 w-4 text-emerald-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* İletişim */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                İletişim Bilgileri
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {vendor.phone && (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Telefon</p>
                      <a
                        href={`tel:${vendor.phone}`}
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">E-posta</p>
                      <a
                        href={`mailto:${vendor.email}`}
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                )}
                {vendor.website_url && (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Web Sitesi</p>
                      <a
                        href={vendor.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {vendor.website_url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
                {vendor.address_text && (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-5 w-5 text-emerald-600"
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
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Adres</p>
                      <p className="font-medium text-slate-900">
                        {vendor.address_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Yorumlar */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <svg
                  className="h-5 w-5 text-emerald-600"
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
                Müşteri Yorumları
              </h2>

              {reviews && reviews.length > 0 ? (
                <div className="mt-4">
                  <ReviewList
                    reviews={reviews}
                    avgRating={ratingData?.avg_rating || null}
                    reviewCount={ratingData?.review_count || 0}
                  />
                </div>
              ) : (
                <p className="mt-4 text-slate-500">
                  Bu firma için henüz yorum bulunmuyor. İlk yorumu siz
                  yapabilirsiniz.
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-6">
                <ReviewForm
                  vendorId={vendor.id}
                  vendorName={vendor.business_name}
                />
              </div>
            </section>
          </div>

          {/* Sağ Kolon - Sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              {/* Teklif Formu */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <LeadForm
                  vendorId={vendor.id}
                  vendorName={vendor.business_name}
                />
              </div>

              {/* Güvence */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <h3 className="font-semibold text-slate-900">
                  Neden Cateringle?
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {[
                    "Bilgileriniz gizli tutulur",
                    "Teklif almak tamamen ücretsiz",
                    "Firmadan hızlı geri dönüş",
                    "Sorularınız için destek",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Üyelik Tarihi */}
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <svg
                      className="h-5 w-5 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Üyelik Tarihi</p>
                    <p className="font-medium text-slate-900">
                      {new Date(vendor.created_at).toLocaleDateString("tr-TR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
