// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Cateringle.com | Türkiye'nin Catering Firmaları Platformu",
  description:
    "Düğün, nişan, kurumsal toplantı ve özel etkinlikler için en uygun catering firmalarını keşfedin.",
  keywords: [
    "catering",
    "catering firmaları",
    "düğün catering",
    "kurumsal catering",
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

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: featuredVendors } = await supabase
    .from("vendors")
    .select("id, business_name, slug, logo_url, city:cities(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#F5F3FF]">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left - Content */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Yemeğinizi <span className="text-leaf-600">Cateringle</span>'yin
              </h1>

              <p className="mt-6 text-lg text-slate-600">
                Kurumsal toplantılardan özel kutlamalara, etkinliğiniz için en
                uygun catering firmalarını kolayca bulun ve teklif alın.
              </p>

              {/* Feature List */}
              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <svg
                    className="h-5 w-5 text-leaf-500"
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
                  <span>Ücretsiz teklif alın</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <svg
                    className="h-5 w-5 text-leaf-500"
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
                  <span>Onlarca firmayı karşılaştırın</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <svg
                    className="h-5 w-5 text-leaf-500"
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
                  <span>Firmalarla doğrudan iletişim kurun</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/vendors?segment=kurumsal"
                  className="group inline-flex items-center justify-center gap-3 bg-leaf-500 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-leaf-600"
                >
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Kurumsal Müşteriler
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
                <Link
                  href="/vendors?segment=bireysel"
                  className="group inline-flex items-center justify-center gap-3 border-2 border-grape-500 bg-white px-8 py-4 text-base font-semibold text-grape-600 transition-colors hover:bg-grape-50"
                >
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Bireysel Müşteriler
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
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

            {/* Right - Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-white shadow-2xl">
                <Image
                  src="/hero-image.jpg"
                  alt="Catering servisi"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hizmet Türleri */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Nasıl hizmet almak istersiniz?
            </h2>
            <p className="mt-3 text-slate-600">
              İhtiyacınıza göre doğru kategoriyi seçin
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Kurumsal Card */}
            <Link
              href="/vendors?segment=kurumsal"
              className="group relative overflow-hidden border border-slate-200 bg-white p-8 transition-all hover:border-leaf-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-leaf-100 text-3xl">
                  🏢
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-leaf-600">
                    Kurumsal Hizmetler
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Ofis yemekleri, toplantı ikramları, konferans ve kurumsal
                    etkinlikler için profesyonel catering çözümleri.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Ofis Öğle Yemeği
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Toplantı İkramı
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Konferans
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Fuar
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-leaf-500 transition-transform group-hover:scale-x-100" />
            </Link>

            {/* Bireysel Card */}
            <Link
              href="/vendors?segment=bireysel"
              className="group relative overflow-hidden border border-slate-200 bg-white p-8 transition-all hover:border-grape-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-grape-100 text-3xl">
                  🎉
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-grape-600">
                    Bireysel Hizmetler
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Düğün, doğum günü, ev partisi ve özel günleriniz için
                    unutulmaz lezzetler ve servis hizmetleri.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Düğün & Nişan
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Doğum Günü
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Ev Partisi
                    </span>
                    <span className="bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Baby Shower
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-grape-500 transition-transform group-hover:scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Nasıl Çalışır?
            </h2>
            <p className="mt-3 text-slate-600">
              3 adımda etkinliğiniz için catering bulun
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-leaf-500 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Etkinliğinizi Tanımlayın
              </h3>
              <p className="mt-2 text-slate-600">
                Kurumsal mı bireysel mi? Kaç kişi? Nerede ve ne zaman?
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-leaf-500 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Firmaları Karşılaştırın
              </h3>
              <p className="mt-2 text-slate-600">
                Menüleri inceleyin, yorumları okuyun, fiyatları karşılaştırın.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-leaf-500 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                Teklif Alın
              </h3>
              <p className="mt-2 text-slate-600">
                Beğendiğiniz firmalardan ücretsiz teklif alın ve en uygununu
                seçin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Firmalar */}
      {featuredVendors && featuredVendors.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Öne Çıkan Firmalar
                </h2>
                <p className="mt-2 text-slate-600">
                  En çok tercih edilen catering firmaları
                </p>
              </div>
              <Link
                href="/vendors"
                className="hidden items-center gap-2 font-medium text-leaf-600 hover:text-leaf-700 sm:flex"
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

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVendors.map((vendor) => {
                const city = vendor.city as { name: string } | null;
                return (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.slug}`}
                    className="group border border-slate-200 bg-white p-6 transition-all hover:border-leaf-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-slate-100">
                        {vendor.logo_url ? (
                          <Image
                            src={vendor.logo_url}
                            alt={vendor.business_name || ""}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-leaf-600">
                            {vendor.business_name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-leaf-600">
                          {vendor.business_name}
                        </h3>
                        {city?.name && (
                          <p className="text-sm text-slate-500">{city.name}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 font-medium text-leaf-600 hover:text-leaf-700"
              >
                Tüm Firmaları Gör
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
      )}

      {/* CTA Section */}
      <section className="bg-leaf-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Catering firması mısınız?
          </h2>
          <p className="mt-4 text-lg text-leaf-100">
            Cateringle'ye katılın, binlerce potansiyel müşteriye ulaşın.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-4 font-semibold text-leaf-700 transition-colors hover:bg-leaf-50"
          >
            Hemen Kaydol
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
      </section>
    </main>
  );
}
