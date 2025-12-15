"use client";

import { useState } from "react";
import Link from "next/link";
import FavoriteButton from "../../components/FavoriteButton";
import ImageCarousel from "../../components/ImageCarousel";
import VendorBadges from "../../components/VendorBadges";
import QuickQuoteModal from "../../components/QuickQuoteModal";
import { MapPin, Star, PaperPlaneTilt } from "@phosphor-icons/react";

interface VendorImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface VendorCardProps {
  vendor: {
    id: string;
    business_name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    avg_price_per_person: number | null;
    min_guest_count: number | null;
    max_guest_count: number | null;
    lead_time_type?: string | null;
    available_24_7?: boolean;
    has_refrigerated_vehicle?: boolean;
    serves_outside_city?: boolean;
    halal_certified?: boolean;
    free_tasting?: boolean;
    free_delivery?: boolean;
    accepts_last_minute?: boolean;
    // İki farklı format destekle (eski ve yeni)
    city?: { name: string } | null;
    district?: { name: string } | null;
    city_name?: string | null;
    district_name?: string | null;
    // Rating - iki format
    avg_rating?: number | null;
    review_count?: number | null;
    vendor_ratings?:
      | { avg_rating: number | null; review_count: number | null }[]
      | null;
    vendor_cuisines?: { cuisine_type_id: number }[];
    vendor_delivery_models?: { delivery_model_id: number }[];
    // Images array (search_vendors RPC'den)
    images?: VendorImage[];
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const [isQuickQuoteOpen, setIsQuickQuoteOpen] = useState(false);

  // Images - is_primary olanı öne al
  const sortedImages = [...(vendor.images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  // logo_url varsa ve images boşsa, logo'yu images olarak kullan
  const carouselImages =
    sortedImages.length > 0
      ? sortedImages
      : vendor.logo_url
      ? [{ id: "logo", image_url: vendor.logo_url, is_primary: true }]
      : [];

  // Rating - her iki formatı destekle
  const rating = vendor.vendor_ratings?.[0];
  const avgRating = vendor.avg_rating ?? rating?.avg_rating;
  const reviewCount = vendor.review_count ?? rating?.review_count;
  const hasRating = avgRating != null && avgRating > 0;

  // Konum - her iki formatı destekle
  const cityName = vendor.city_name ?? vendor.city?.name;
  const districtName = vendor.district_name ?? vendor.district?.name;

  return (
    <>
      <div className="group">
        {/* Görsel Alanı */}
        <div className="relative">
          <Link href={`/vendors/${vendor.slug}`}>
            <ImageCarousel
              images={carouselImages}
              alt={vendor.business_name}
              fallbackLetter={vendor.business_name?.charAt(0)}
              aspectRatio="4/3"
              showArrows={true}
              showDots={true}
            />
          </Link>

          {/* Favori Butonu */}
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton vendorId={vendor.id} />
          </div>

          {/* Hızlı Teklif Butonu - Hover'da görünür */}
          <button
            onClick={() => setIsQuickQuoteOpen(true)}
            className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-medium text-slate-900 opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100"
          >
            <PaperPlaneTilt size={16} weight="bold" className="text-leaf-600" />
            Hızlı Teklif
          </button>
        </div>

        {/* Bilgi Alanı */}
        <Link href={`/vendors/${vendor.slug}`} className="block mt-3">
          {/* Üst satır: İsim + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-leaf-600 transition-colors">
              {vendor.business_name}
            </h3>
            {hasRating && (
              <div className="flex shrink-0 items-center gap-1">
                <Star size={14} weight="fill" className="text-slate-900" />
                <span className="text-sm font-medium text-slate-900">
                  {Number(avgRating).toFixed(1)}
                </span>
                {reviewCount && reviewCount > 0 && (
                  <span className="text-sm text-slate-500">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Konum */}
          {(cityName || districtName) && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} weight="light" />
              {[districtName, cityName].filter(Boolean).join(", ")}
            </p>
          )}

          {/* Badge'ler */}
          <VendorBadges
            vendor={vendor}
            maxBadges={3}
            size="sm"
            showLabel={true}
            className="mt-2"
          />

          {/* Fiyat */}
          {typeof vendor.avg_price_per_person === "number" && (
            <p className="mt-2">
              <span className="font-semibold text-slate-900">
                ₺{Math.round(vendor.avg_price_per_person)}
              </span>
              <span className="text-slate-500"> / kişi</span>
            </p>
          )}
        </Link>
      </div>

      {/* Quick Quote Modal */}
      <QuickQuoteModal
        isOpen={isQuickQuoteOpen}
        onClose={() => setIsQuickQuoteOpen(false)}
        vendorId={vendor.id}
        vendorName={vendor.business_name}
      />
    </>
  );
}
