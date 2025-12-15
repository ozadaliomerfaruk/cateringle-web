// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Buildings,
  Confetti,
  MagnifyingGlass,
  CheckCircle,
  ChatCircleDots,
  CurrencyDollar,
  ArrowRight,
  MapPin,
  Cake,
  Champagne,
  Coffee,
  CookingPot,
  Handshake,
  CalendarCheck,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Cateringle.com | Catering Firmaları Platformu",
  description:
    "Düğün, nişan, kurumsal toplantı ve özel etkinlikler için en uygun catering firmalarını keşfedin.",
  keywords: [
    "catering",
    "catering firmaları",
    "düğün catering",
    "kurumsal catering",
  ],
  openGraph: {
    title: "Cateringle.com | Catering Firmaları Platformu",
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
    <main className="min-h-screen bg-white">
      {/* Hero Section - Minimal & Clean */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-2 text-sm font-medium text-leaf-700">
              Catering Platformu
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Etkinliğiniz için{" "}
              <span className="text-leaf-600">mükemmel catering</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Kurumsal toplantılardan özel kutlamalara, yüzlerce catering
              firması arasından size en uygun olanı bulun.
            </p>

            {/* CTA Cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/vendors?segment=kurumsal"
                className="group relative flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-leaf-500 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <Buildings size={28} weight="light" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Kurumsal Etkinlik
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Ofis, toplantı, konferans
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="absolute right-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-leaf-500"
                />
              </Link>

              <Link
                href="/vendors?segment=bireysel"
                className="group relative flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-grape-500 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
                  <Confetti size={28} weight="light" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Özel Kutlama</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Düğün, doğum günü, parti
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="absolute right-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-grape-500"
                />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={18}
                  weight="fill"
                  className="text-leaf-500"
                />
                Ücretsiz teklif
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle
                  size={18}
                  weight="fill"
                  className="text-leaf-500"
                />
                Hızlı yanıt
              </div>
            </div>
          </div>

          {/* Decorative Icons - Floating */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <CookingPot
              size={48}
              weight="light"
              className="absolute left-[10%] top-[20%] rotate-[-15deg] text-leaf-300"
            />
            <Cake
              size={40}
              weight="light"
              className="absolute right-[15%] top-[15%] rotate-[10deg] text-leaf-300"
            />
            <Coffee
              size={36}
              weight="light"
              className="absolute bottom-[25%] left-[8%] rotate-[5deg] text-leaf-300"
            />
            <Champagne
              size={44}
              weight="light"
              className="absolute bottom-[20%] right-[10%] rotate-[-10deg] text-leaf-300"
            />
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ne tür bir etkinlik planlıyorsunuz?
            </h2>
            <p className="mt-3 text-slate-600">
              İhtiyacınıza göre kategori seçin
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Kategori kartları */}
            {[
              {
                name: "Ofis Yemekleri",
                desc: "Günlük öğle yemekleri",
                icon: Coffee,
                href: "/vendors?segment=kurumsal&category=ofis-ogle-yemekleri",
                color: "bg-amber-50 text-amber-600",
              },
              {
                name: "Toplantı İkramları",
                desc: "Kahvaltı & coffee break",
                icon: Handshake,
                href: "/vendors?segment=kurumsal&category=toplanti-ikramlari",
                color: "bg-blue-50 text-blue-600",
              },
              {
                name: "Düğün & Nişan",
                desc: "Özel gün organizasyonu",
                icon: Champagne,
                href: "/vendors?segment=bireysel&category=dugun-nisan",
                color: "bg-pink-50 text-pink-600",
              },
              {
                name: "Doğum Günü",
                desc: "Parti & kutlama",
                icon: Cake,
                href: "/vendors?segment=bireysel&category=dogum-gunu",
                color: "bg-purple-50 text-purple-600",
              },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${cat.color} transition-transform group-hover:scale-110`}
                >
                  <cat.icon size={28} weight="light" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{cat.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 text-sm font-medium text-leaf-600 hover:text-leaf-700"
            >
              Tüm kategorileri gör
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              3 adımda catering bulun
            </h2>
            <p className="mt-3 text-slate-600">Hızlı, kolay ve ücretsiz</p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "1",
                icon: MagnifyingGlass,
                title: "Firmaları Keşfedin",
                desc: "Bölgenizdeki catering firmalarını inceleyin, menülerini ve fiyatlarını karşılaştırın.",
              },
              {
                step: "2",
                icon: ChatCircleDots,
                title: "Teklif İsteyin",
                desc: "Beğendiğiniz firmalara ücretsiz teklif talebi gönderin. Detaylarınızı paylaşın.",
              },
              {
                step: "3",
                icon: CalendarCheck,
                title: "Rezervasyon Yapın",
                desc: "Gelen teklifleri değerlendirin ve size en uygun firmayı seçin.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-50">
                  <item.icon
                    size={32}
                    weight="light"
                    className="text-leaf-600"
                  />
                </div>
                <div className="absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan Firmalar */}
      {featuredVendors && featuredVendors.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Öne çıkan firmalar
                </h2>
                <p className="mt-2 text-slate-600">
                  En çok tercih edilen catering firmaları
                </p>
              </div>
              <Link
                href="/vendors"
                className="hidden items-center gap-2 text-sm font-medium text-leaf-600 hover:text-leaf-700 sm:flex"
              >
                Tümünü gör
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVendors.map((vendor) => {
                const city = vendor.city as { name: string } | null;
                return (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
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
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900 group-hover:text-leaf-600">
                        {vendor.business_name}
                      </h3>
                      {city?.name && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin size={14} weight="light" />
                          {city.name}
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-leaf-500"
                    />
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                Tüm firmaları gör
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Neden Cateringle */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Neden Cateringle?
            </h2>
            <p className="mt-4 text-slate-600">
              Etkinliğiniz için doğru catering firmasını bulmak hiç bu kadar
              kolay olmamıştı.
            </p>

            <div className="mt-12 grid gap-8 text-left sm:grid-cols-3">
              {[
                {
                  icon: CurrencyDollar,
                  title: "Ücretsiz Teklif",
                  desc: "Sınırsız firmadan ücretsiz teklif alın, karşılaştırın.",
                },
                {
                  icon: CheckCircle,
                  title: "Doğrulanmış Firmalar",
                  desc: "Tüm firmalar ekibimiz tarafından incelenir ve onaylanır.",
                },
                {
                  icon: ChatCircleDots,
                  title: "Hızlı İletişim",
                  desc: "Firmalarla doğrudan ve hızlı iletişim kurun.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50">
                    <item.icon
                      size={28}
                      weight="light"
                      className="text-leaf-600"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-leaf-600 to-leaf-700 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Catering firması mısınız?
          </h2>
          <p className="mt-4 text-lg text-leaf-100">
            Cateringle&apos;ye katılın, binlerce potansiyel müşteriye ulaşın.
            Kayıt ücretsiz!
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-leaf-700 transition-all hover:bg-leaf-50 hover:shadow-lg"
          >
            Hemen Başvur
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
