// src/app/vendors/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/seo";
import LeadForm from "../../../components/LeadForm";
import ReviewForm from "../../../components/ReviewForm";
import ReviewList from "../../../components/ReviewList";
import FavoriteButton from "../../../components/FavoriteButton";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Truck,
  Snowflake,
  MapTrifold,
  Phone,
  Envelope,
  Globe,
  WhatsappLogo,
  Calendar,
  CheckCircle,
  ShieldCheck,
  CaretLeft,
  Export,
  Medal,
  Timer,
} from "@phosphor-icons/react/dist/ssr";

const BASE_URL = "https://cateringle.com";

// Type definitions
type VendorService = {
  service: {
    name: string;
    group: { icon: string | null } | null;
  } | null;
};

type VendorCuisine = {
  cuisine_type: {
    name: string;
    icon: string | null;
    category: string | null;
  } | null;
};

type VendorDeliveryModel = {
  delivery_model: {
    name: string;
    icon: string | null;
    description: string | null;
  } | null;
};

type VendorTag = {
  tag: {
    name: string;
    icon: string | null;
    group: {
      name: string;
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
    .select("business_name, description, city_id, logo_url")
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

  const title = `${vendor.business_name} | Catering Hizmeti${cityName ? ` - ${cityName}` : ""}`;
  const description = vendor.description?.slice(0, 155) || `${vendor.business_name} catering hizmetleri. Fiyat teklifi alın.`;
  const url = `${BASE_URL}/vendors/${slug}`;
  const image = vendor.logo_url || `${BASE_URL}/og-image.jpg`;

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
          url: image,
          width: 800,
          height: 600,
          alt: vendor.business_name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
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
      city_id, district_id, status, created_at,
      lead_time_hours, lead_time_type, accepts_last_minute,
      weekend_surcharge_percent, holiday_surcharge_percent,
      delivery_pricing_type, delivery_base_fee, delivery_notes,
      has_refrigerated_vehicle, serves_outside_city, available_24_7,
      halal_certified, free_tasting, free_delivery
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    notFound();
  }

  // Tüm verileri paralel çek
  const [
    { data: images },
    { data: reviews },
    { data: ratingData },
    { data: menuCategories },
    { data: packages },
    { data: vendorServices },
    { data: vendorCuisines },
    { data: vendorDeliveryModels },
    { data: vendorTags },
  ] = await Promise.all([
    supabase
      .from("vendor_images")
      .select("id, image_url")
      .eq("vendor_id", vendor.id)
      .order("sort_order")
      .limit(5),
    supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, is_verified, created_at")
      .eq("vendor_id", vendor.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("vendor_ratings")
      .select("avg_rating, review_count")
      .eq("vendor_id", vendor.id)
      .maybeSingle(),
    supabase
      .from("menu_categories")
      .select(
        "id, name, description, menu_items (id, name, description, price_per_person)"
      )
      .eq("vendor_id", vendor.id)
      .order("sort_order"),
    supabase
      .from("packages")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("vendor_services")
      .select("service:services(name, group:service_groups(icon))")
      .eq("vendor_id", vendor.id),
    supabase
      .from("vendor_cuisines")
      .select("cuisine_type:cuisine_types(name, icon, category)")
      .eq("vendor_id", vendor.id),
    supabase
      .from("vendor_delivery_models")
      .select("delivery_model:delivery_models(name, icon, description)")
      .eq("vendor_id", vendor.id),
    supabase
      .from("vendor_tags")
      .select("tag:tags(name, icon, group:tag_groups(name, icon))")
      .eq("vendor_id", vendor.id),
  ]);

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
  const hasRating = ratingData?.avg_rating && ratingData.avg_rating > 0;
  const reviewCount = ratingData?.review_count || 0;

  // Özellikler listesi
  const features = [];
  if (vendor.available_24_7)
    features.push({
      icon: Clock,
      label: "7/24 Hizmet",
      desc: "Her zaman ulaşılabilir",
    });
  if (vendor.has_refrigerated_vehicle)
    features.push({
      icon: Snowflake,
      label: "Frigorifik Araç",
      desc: "Soğuk zincir garantisi",
    });
  if (vendor.serves_outside_city)
    features.push({
      icon: MapTrifold,
      label: "Şehir Dışı Teslimat",
      desc: "Farklı şehirlere hizmet",
    });
  if (vendor.halal_certified)
    features.push({
      icon: Medal,
      label: "Helal Sertifikalı",
      desc: "Helal gıda garantisi",
    });
  if (vendor.free_tasting)
    features.push({
      icon: CheckCircle,
      label: "Ücretsiz Tadım",
      desc: "Önceden tadım imkanı",
    });
  if (vendor.free_delivery)
    features.push({
      icon: Truck,
      label: "Ücretsiz Teslimat",
      desc: "Teslimat ücreti yok",
    });
  if (vendor.accepts_last_minute)
    features.push({
      icon: Timer,
      label: "Son Dakika Kabul",
      desc: "Acil siparişler kabul edilir",
    });

  // Price range for schema
  const priceRange = vendor.avg_price_per_person
    ? vendor.avg_price_per_person < 100
      ? "₺"
      : vendor.avg_price_per_person < 200
        ? "₺₺"
        : "₺₺₺"
    : undefined;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <LocalBusinessSchema
        name={vendor.business_name}
        description={vendor.description}
        url={`${BASE_URL}/vendors/${vendor.slug}`}
        logo={vendor.logo_url}
        telephone={vendor.phone}
        email={vendor.email}
        address={{
          city: cityName,
          district: districtName,
          addressText: vendor.address_text,
        }}
        priceRange={priceRange}
        rating={
          hasRating
            ? {
                ratingValue: ratingData.avg_rating,
                reviewCount: reviewCount,
              }
            : null
        }
        images={galleryImages.map((img) => img.image_url)}
        serviceArea={cityName ? [cityName] : undefined}
      />
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: BASE_URL },
          { name: "Catering Firmaları", url: `${BASE_URL}/vendors` },
          { name: vendor.business_name, url: `${BASE_URL}/vendors/${vendor.slug}` },
        ]}
      />

      <main className="min-h-screen bg-white">
      {/* Üst Bar - Geri + Paylaş + Favori */}
      <div className="sticky top-16 z-20 border-b border-slate-200 bg-white lg:top-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link
            href="/vendors"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <CaretLeft size={20} weight="bold" />
            <span className="hidden sm:inline">Firmalara Dön</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              <Export size={18} />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
            <FavoriteButton vendorId={vendor.id} size="md" />
          </div>
        </div>
      </div>

      {/* Galeri Section - Airbnb Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-xl">
            {/* Ana Görsel */}
            <div className="relative col-span-4 aspect-[16/9] sm:col-span-2 sm:row-span-2 sm:aspect-square">
              <Image
                src={galleryImages[0]?.image_url || vendor.logo_url || ""}
                alt={vendor.business_name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Küçük Görseller */}
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div
                key={img.id}
                className="relative hidden aspect-square sm:block"
              >
                <Image
                  src={img.image_url}
                  alt={`${vendor.business_name} - ${idx + 2}`}
                  fill
                  className="object-cover"
                />
                {idx === 3 && galleryImages.length > 5 && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/50">
                    <span className="text-sm font-medium">
                      +{galleryImages.length - 5} fotoğraf
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : vendor.logo_url ? (
          <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-xl">
            <Image
              src={vendor.logo_url}
              alt={vendor.business_name}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="mx-auto flex aspect-video max-w-2xl items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-6xl font-bold text-slate-300">
              {vendor.business_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </section>

      {/* Ana İçerik */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Sol Kolon - Bilgiler */}
          <div className="lg:col-span-2">
            {/* Başlık + Konum + Rating */}
            <div className="border-b border-slate-200 pb-6">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {vendor.business_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600">
                {locationText && (
                  <span className="flex items-center gap-1">
                    <MapPin size={18} weight="light" />
                    {locationText}
                  </span>
                )}
                {hasRating && (
                  <span className="flex items-center gap-1">
                    <Star size={18} weight="fill" className="text-slate-900" />
                    <span className="font-medium text-slate-900">
                      {Number(ratingData.avg_rating).toFixed(1)}
                    </span>
                    <span className="text-slate-500">
                      ({reviewCount} yorum)
                    </span>
                  </span>
                )}
                {vendor.min_guest_count && vendor.max_guest_count && (
                  <span className="flex items-center gap-1">
                    <Users size={18} weight="light" />
                    {vendor.min_guest_count} - {vendor.max_guest_count} kişi
                  </span>
                )}
              </div>
            </div>

            {/* Özellikler */}
            {features.length > 0 && (
              <div className="border-b border-slate-200 py-6">
                <div className="space-y-4">
                  {features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <feature.icon
                        size={24}
                        weight="light"
                        className="mt-0.5 shrink-0 text-slate-700"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {feature.label}
                        </p>
                        <p className="text-sm text-slate-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Açıklama */}
            {vendor.description && (
              <div className="border-b border-slate-200 py-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Hakkında
                </h2>
                <p className="mt-3 whitespace-pre-line text-slate-600 leading-relaxed">
                  {vendor.description}
                </p>
              </div>
            )}

            {/* Bu firma neler sunuyor? */}
            {((vendorServices && vendorServices.length > 0) ||
              (vendorCuisines && vendorCuisines.length > 0) ||
              (vendorDeliveryModels && vendorDeliveryModels.length > 0)) && (
              <div className="border-b border-slate-200 py-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Bu firma neler sunuyor?
                </h2>

                {/* Hizmetler */}
                {vendorServices && vendorServices.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Hizmetler
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(vendorServices as VendorService[]).map(
                        (vs, idx) =>
                          vs.service?.name && (
                            <span
                              key={idx}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                            >
                              {vs.service.name}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* Mutfak Türleri */}
                {vendorCuisines && vendorCuisines.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Mutfak Türleri
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(vendorCuisines as VendorCuisine[]).map(
                        (vc, idx) =>
                          vc.cuisine_type?.name && (
                            <span
                              key={idx}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                            >
                              {vc.cuisine_type.icon} {vc.cuisine_type.name}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* Teslimat Modelleri */}
                {vendorDeliveryModels && vendorDeliveryModels.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Teslimat Seçenekleri
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(vendorDeliveryModels as VendorDeliveryModel[]).map(
                        (vdm, idx) =>
                          vdm.delivery_model?.name && (
                            <span
                              key={idx}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                            >
                              {vdm.delivery_model.icon}{" "}
                              {vdm.delivery_model.name}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Menüler */}
            {menuCategories && menuCategories.length > 0 && (
              <div className="border-b border-slate-200 py-6">
                <h2 className="text-lg font-semibold text-slate-900">Menü</h2>
                <div className="mt-4 space-y-6">
                  {(menuCategories as MenuCategory[]).map((category) => (
                    <div key={category.id}>
                      <h3 className="font-medium text-slate-800">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {category.description}
                        </p>
                      )}
                      {category.menu_items &&
                        category.menu_items.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {category.menu_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
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
                                  <span className="shrink-0 font-semibold text-slate-900">
                                    ₺{item.price_per_person}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paketler */}
            {packages && packages.length > 0 && (
              <div className="border-b border-slate-200 py-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Paketler
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(packages as Package[]).map((pkg) => (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <h3 className="font-semibold text-slate-900">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {pkg.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        {pkg.price_per_person && (
                          <span className="text-lg font-bold text-leaf-600">
                            ₺{pkg.price_per_person}/kişi
                          </span>
                        )}
                        {pkg.min_guest_count && pkg.max_guest_count && (
                          <span className="text-sm text-slate-500">
                            {pkg.min_guest_count}-{pkg.max_guest_count} kişi
                          </span>
                        )}
                      </div>
                      {pkg.includes && pkg.includes.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {pkg.includes.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle
                                size={16}
                                weight="fill"
                                className="text-leaf-500"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bu firma size neler sunabilir? - Özellikler & Etiketler */}
            {(features.length > 0 || (vendorTags && vendorTags.length > 0)) && (
              <div className="border-b border-slate-200 py-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Bu firma size neler sunabilir?
                </h2>

                {/* Özellikler Grid */}
                {features.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <feature.icon
                            size={20}
                            weight="light"
                            className="text-slate-700"
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Etiketler */}
                {vendorTags && vendorTags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-500">
                      Öne Çıkan Özellikler
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(vendorTags as VendorTag[]).map(
                        (vt, idx) =>
                          vt.tag?.name && (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                            >
                              {vt.tag.icon && <span>{vt.tag.icon}</span>}
                              {vt.tag.name}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Yorumlar */}
            <div className="border-b border-slate-200 py-6">
              <div className="flex items-center gap-2">
                <Star size={24} weight="fill" className="text-slate-900" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {hasRating
                    ? `${Number(ratingData.avg_rating).toFixed(
                        1
                      )} · ${reviewCount} yorum`
                    : "Yorumlar"}
                </h2>
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="mt-4">
                  <ReviewList
                    reviews={reviews}
                    avgRating={ratingData?.avg_rating || null}
                    reviewCount={reviewCount}
                  />
                </div>
              ) : (
                <p className="mt-4 text-slate-500">
                  Henüz yorum bulunmuyor. İlk yorumu siz yapın!
                </p>
              )}

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <ReviewForm
                  vendorId={vendor.id}
                  vendorName={vendor.business_name}
                />
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="py-6">
              <h2 className="text-lg font-semibold text-slate-900">İletişim</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-leaf-500 hover:bg-leaf-50"
                  >
                    <Phone size={24} weight="light" className="text-leaf-600" />
                    <div>
                      <p className="text-xs text-slate-500">Telefon</p>
                      <p className="font-medium text-slate-900">
                        {vendor.phone}
                      </p>
                    </div>
                  </a>
                )}
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-green-500 hover:bg-green-50"
                  >
                    <WhatsappLogo
                      size={24}
                      weight="fill"
                      className="text-green-600"
                    />
                    <div>
                      <p className="text-xs text-slate-500">WhatsApp</p>
                      <p className="font-medium text-slate-900">Mesaj Gönder</p>
                    </div>
                  </a>
                )}
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-leaf-500 hover:bg-leaf-50"
                  >
                    <Envelope
                      size={24}
                      weight="light"
                      className="text-leaf-600"
                    />
                    <div>
                      <p className="text-xs text-slate-500">E-posta</p>
                      <p className="font-medium text-slate-900">
                        {vendor.email}
                      </p>
                    </div>
                  </a>
                )}
                {vendor.website_url && (
                  <a
                    href={vendor.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-leaf-500 hover:bg-leaf-50"
                  >
                    <Globe size={24} weight="light" className="text-leaf-600" />
                    <div>
                      <p className="text-xs text-slate-500">Web Sitesi</p>
                      <p className="font-medium text-slate-900 truncate">
                        {vendor.website_url.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </a>
                )}
              </div>
              {vendor.address_text && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <MapPin
                    size={24}
                    weight="light"
                    className="shrink-0 text-leaf-600"
                  />
                  <div>
                    <p className="text-xs text-slate-500">Adres</p>
                    <p className="font-medium text-slate-900">
                      {vendor.address_text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Sticky Teklif Formu */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
              {/* Fiyat Kartı */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
                {/* Fiyat */}
                {typeof vendor.avg_price_per_person === "number" && (
                  <div className="mb-4 border-b border-slate-100 pb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        ₺{Math.round(vendor.avg_price_per_person)}
                      </span>
                      <span className="text-slate-500">/ kişi başı</span>
                    </div>
                    {vendor.min_guest_count && (
                      <p className="mt-1 text-sm text-slate-500">
                        Minimum {vendor.min_guest_count} kişi
                      </p>
                    )}
                  </div>
                )}

                {/* Teklif Formu */}
                <LeadForm
                  vendorId={vendor.id}
                  vendorName={vendor.business_name}
                  vendorFeatures={{
                    has_refrigerated_vehicle: vendor.has_refrigerated_vehicle,
                    serves_outside_city: vendor.serves_outside_city,
                    available_24_7: vendor.available_24_7,
                    halal_certified: vendor.halal_certified,
                    free_tasting: vendor.free_tasting,
                    free_delivery: vendor.free_delivery,
                    accepts_last_minute: vendor.accepts_last_minute,
                  }}
                />

                {/* Alt Not */}
                <p className="mt-4 text-center text-xs text-slate-500">
                  Henüz ödeme yapılmayacak
                </p>
              </div>

              {/* Güvence Kartı */}
              <div className="mt-4 rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={20}
                    weight="fill"
                    className="text-rose-500"
                  />
                  <span className="font-medium text-slate-900">
                    Cateringle Güvencesi
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {[
                    "Bilgileriniz gizli tutulur",
                    "Teklif almak tamamen ücretsiz",
                    "Hızlı yanıt garantisi",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="text-leaf-500"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Üyelik Bilgisi */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <Calendar size={20} weight="light" className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  {new Date(vendor.created_at).toLocaleDateString("tr-TR", {
                    month: "long",
                    year: "numeric",
                  })}
                  &apos;dan beri üye
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
