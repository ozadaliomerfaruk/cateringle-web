"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import FavoriteButton from "../../components/FavoriteButton";
import { MapPin, Star, Users, Clock } from "@phosphor-icons/react";

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
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const [_isHovered, setIsHovered] = useState(false);

  // Sadece logo_url kullan
  const hasImage = !!vendor.logo_url;

  // Rating - her iki formatı destekle
  const rating = vendor.vendor_ratings?.[0];
  const avgRating = vendor.avg_rating ?? rating?.avg_rating;
  const reviewCount = vendor.review_count ?? rating?.review_count;
  const hasRating = avgRating != null && avgRating > 0;

  // Konum - her iki formatı destekle
  const cityName = vendor.city_name ?? vendor.city?.name;
  const districtName = vendor.district_name ?? vendor.district?.name;

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Görsel Alanı */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {hasImage ? (
            <Image
              src={vendor.logo_url!}
              alt={vendor.business_name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-4xl font-bold text-slate-300">
                {vendor.business_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Favori Butonu */}
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton vendorId={vendor.id} />
        </div>
      </div>

      {/* Bilgi Alanı */}
      <div className="mt-3">
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
                <span className="text-sm text-slate-500">({reviewCount})</span>
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

        {/* Kişi sayısı */}
        {vendor.min_guest_count && vendor.max_guest_count && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Users size={14} weight="light" />
            {vendor.min_guest_count} - {vendor.max_guest_count} kişi
          </p>
        )}

        {/* 7/24 rozeti */}
        {vendor.available_24_7 && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Clock size={14} weight="light" />
            7/24 Hizmet
          </p>
        )}

        {/* Fiyat */}
        {typeof vendor.avg_price_per_person === "number" && (
          <p className="mt-2">
            <span className="font-semibold text-slate-900">
              ₺{Math.round(vendor.avg_price_per_person)}
            </span>
            <span className="text-slate-500"> / kişi</span>
          </p>
        )}
      </div>
    </Link>
  );
}
