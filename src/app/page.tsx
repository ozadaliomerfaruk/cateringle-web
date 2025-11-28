// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Tables } from "@/types/database";

export const metadata: Metadata = {
  title: "Cateringle.com | Türkiye'nin Catering Firmaları Platformu",
  description:
    "Düğün, nişan, kurumsal toplantı ve özel etkinlikler için en uygun catering firmalarını keşfedin. Şehir, kişi sayısı ve bütçenize göre filtreleyin, ücretsiz teklif alın.",
  keywords: [
    "catering",
    "catering firmaları",
    "düğün catering",
    "eve catering",
    "kurumsal catering",
    "nişan catering",
    "toplu yemek",
    "organizasyon yemek",
    "etkinlik catering",
  ],
  openGraph: {
    title: "Cateringle.com | Türkiye'nin Catering Firmaları Platformu",
    description:
      "Düğün, nişan, kurumsal toplantı için en uygun catering firmalarını keşfedin.",
    url: "https://cateringle.com",
    siteName: "Cateringle.com",
    locale: "tr_TR",
    type: "website",
  },
};

type Vendor = Tables<"vendors">;
type City = Tables<"cities">;

interface VendorWithCity extends Vendor {
  city: Pick<City, "name"> | null;
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("sort_order")
    .limit(8);

  const { data: featuredVendors } = await supabase
    .from("vendors")
    .select(
      "id, business_name, slug, logo_url, city:cities(name), avg_price_per_person"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Sol - Başlık */}
            <div className="text-center lg:text-left">
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                Catering Platformu
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Etkinliğiniz için{" "}
                <span className="text-emerald-200">
                  mükemmel catering hizmeti
                </span>
              </h1>

              <p className="mt-6 text-lg text-emerald-100 sm:text-xl">
                Düğün, nişan, kurumsal toplantı ve özel günleriniz için en uygun
                catering firmalarını keşfedin.
              </p>

              {/* Güven Sinyalleri */}
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
                <div className="flex items-center gap-2 text-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-300"
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
                  <span className="text-sm font-medium">
                    Ücretsiz teklif alın
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-300"
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
                  <span className="text-sm font-medium">
                    Kolayca karşılaştırın
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-300"
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
                  <span className="text-sm font-medium">Doğrudan iletişim</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/vendors"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
                >
                  Firmaları Keşfet
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Tedarikçi Ol
                </Link>
              </div>
            </div>

            {/* Sağ - Arama Formu */}
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    Catering Firması Ara
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Size en uygun firmayı bulalım
                  </p>
                </div>

                <form action="/vendors" method="GET" className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Nerede?
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                      <select
                        name="city"
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Şehir seçin</option>
                        {cities?.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Ne zaman?
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                      <input
                        type="date"
                        name="event_date"
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Kaç kişi?
                      </label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                        <input
                          type="number"
                          name="min_guest"
                          min="1"
                          placeholder="Kişi sayısı"
                          className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Bütçe
                      </label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                        <input
                          type="number"
                          name="max_price"
                          min="0"
                          placeholder="TL/kişi"
                          className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/40"
                  >
                    Firmaları Göster
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Teklif almak tamamen ücretsizdir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ne tür bir etkinlik planlıyorsunuz?
            </h2>
            <p className="mt-3 text-slate-600">
              Etkinlik türünüze göre uzmanlaşmış firmaları bulun
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/vendors?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <svg
                    className="h-6 w-6 text-emerald-600"
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
                <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-emerald-600">
                  {cat.name}
                </h3>
                <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-emerald-500 transition-transform group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Tüm kategorileri gör
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
            </Link>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
              Nasıl Çalışır?
            </span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Birkaç adımda etkinliğiniz için catering bulun
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Karmaşık süreçlerle uğraşmayın. Aradığınız catering hizmetine
              kolayca ulaşın.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Etkinliğinizi tanımlayın
              </h3>
              <p className="mt-2 text-slate-600">
                Nerede, ne zaman ve kaç kişilik bir etkinlik planlıyorsunuz? Bu
                bilgilerle size uygun firmaları listeleyelim.
              </p>
              {/* Connector Line */}
              <div className="absolute right-0 top-8 hidden h-0.5 w-1/2 bg-gradient-to-r from-emerald-300 to-transparent sm:block" />
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Firmaları inceleyin
              </h3>
              <p className="mt-2 text-slate-600">
                Menülere, fotoğraflara ve müşteri yorumlarına göz atın.
                Beğendiğiniz firmaları karşılaştırın.
              </p>
              <div className="absolute left-0 top-8 hidden h-0.5 w-1/2 bg-gradient-to-l from-emerald-300 to-transparent sm:block" />
              <div className="absolute right-0 top-8 hidden h-0.5 w-1/2 bg-gradient-to-r from-emerald-300 to-transparent sm:block" />
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Teklif isteyin
              </h3>
              <p className="mt-2 text-slate-600">
                Beğendiğiniz firmaya ücretsiz teklif talebi gönderin. Firma
                sizinle iletişime geçsin.
              </p>
              <div className="absolute left-0 top-8 hidden h-0.5 w-1/2 bg-gradient-to-l from-emerald-300 to-transparent sm:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Firmalar */}
      {featuredVendors && featuredVendors.length > 0 && (
        <section className="bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Catering Firmaları
                </h2>
                <p className="mt-2 text-slate-600">
                  Platformumuzdaki firmaları keşfedin
                </p>
              </div>
              <Link
                href="/vendors"
                className="hidden items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:inline-flex"
              >
                Tümünü Gör
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
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVendors.map((vendor) => {
                const typedVendor = vendor as unknown as VendorWithCity;
                return (
                  <Link
                    key={typedVendor.id}
                    href={`/vendors/${typedVendor.slug}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="aspect-video bg-linear-to-br from-emerald-100 to-teal-50 p-6">
                      <div className="flex h-full items-center justify-center">
                        {typedVendor.logo_url ? (
                          <div className="relative h-20 w-20">
                            <Image
                              src={typedVendor.logo_url}
                              alt={typedVendor.business_name}
                              fill
                              className="rounded-xl object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-sm">
                            <svg
                              className="h-10 w-10 text-emerald-600"
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
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                        {typedVendor.business_name}
                      </h3>
                      {typedVendor.city?.name && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
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
                          {typedVendor.city.name}
                        </p>
                      )}
                      {typedVendor.avg_price_per_person && (
                        <div className="mt-3">
                          <span className="inline-block rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                            ≈ {Math.round(typedVendor.avg_price_per_person)}{" "}
                            TL/kişi
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"
              >
                Tüm firmaları gör →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Firmalar İçin CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <span className="inline-block rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-400">
                  Catering Firmaları İçin
                </span>
                <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
                  Firmanızı müşterilerinizle buluşturun
                </h2>
                <p className="mt-4 text-slate-300">
                  Cateringle.com&apos;da firmanızı tanıtın, hizmetlerinizi
                  sergileyin ve potansiyel müşterilerden teklif talepleri alın.
                </p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        className="h-4 w-4 text-emerald-400"
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
                    </div>
                    Ücretsiz firma profili oluşturun
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        className="h-4 w-4 text-emerald-400"
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
                    </div>
                    Müşterilerden doğrudan teklif talepleri alın
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        className="h-4 w-4 text-emerald-400"
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
                    </div>
                    Menülerinizi ve fotoğraflarınızı paylaşın
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        className="h-4 w-4 text-emerald-400"
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
                    </div>
                    Müşteri yorumlarıyla güven oluşturun
                  </li>
                </ul>

                <div className="mt-10">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-xl"
                  >
                    Ücretsiz Başvurun
                    <svg
                      className="h-5 w-5"
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
                  </Link>
                </div>
              </div>

              <div className="hidden items-center justify-center bg-gradient-to-br from-emerald-600/20 to-teal-600/20 p-8 lg:flex">
                <div className="text-center text-white">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                    <svg
                      className="h-12 w-12 text-emerald-300"
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
                  <p className="mt-4 text-xl font-medium text-emerald-300">
                    İşinizi büyütün
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
