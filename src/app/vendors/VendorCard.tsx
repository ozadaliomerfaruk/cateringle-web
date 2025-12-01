"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import FavoriteButton from "../../components/FavoriteButton";

interface VendorCardProps {
  vendor: {
    id: string;
    business_name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    cover_image_url?: string | null;
    gallery_images?: string[] | null;
    avg_price_per_person: number | null;
    min_guest_count: number | null;
    max_guest_count: number | null;
    available_24_7?: boolean;
    has_refrigerated_vehicle?: boolean;
    serves_outside_city?: boolean;
    city: { name: string } | null;
    district: { name: string } | null;
    vendor_ratings:
      | { avg_rating: number | null; review_count: number | null }[]
      | null;
    vendor_cuisines?: { cuisine_type_id: number }[];
    vendor_delivery_models?: { delivery_model_id: number }[];
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Tüm görselleri birleştir
  const allImages: string[] = [];
  if (vendor.cover_image_url) allImages.push(vendor.cover_image_url);
  if (vendor.logo_url && !allImages.includes(vendor.logo_url))
    allImages.push(vendor.logo_url);
  if (vendor.gallery_images) {
    vendor.gallery_images.forEach((img) => {
      if (!allImages.includes(img)) allImages.push(img);
    });
  }

  const rating = vendor.vendor_ratings?.[0];
  const hasRating = rating?.avg_rating != null && rating.avg_rating > 0;

  // Özellik ikonları
  const features = [];
  if (vendor.available_24_7) features.push({ icon: "🕐", label: "7/24" });
  if (vendor.has_refrigerated_vehicle)
    features.push({ icon: "🚛", label: "Frigorifik" });
  if (vendor.serves_outside_city)
    features.push({ icon: "🗺️", label: "Şehir dışı" });
  if (vendor.min_guest_count && vendor.max_guest_count) {
    features.push({
      icon: "👥",
      label: `${vendor.min_guest_count}-${vendor.max_guest_count}`,
    });
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg"
    >
      {/* Görsel Alanı */}
      <div className="relative w-full sm:w-72 shrink-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
          {allImages.length > 0 ? (
            <Image
              src={allImages[currentImageIndex]}
              alt={vendor.business_name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-16 w-16 text-slate-300"
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

          {/* Carousel Navigasyonu */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {allImages.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
                {allImages.length > 5 && (
                  <span className="text-xs text-white/80">
                    +{allImages.length - 5}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Favori Butonu */}
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton vendorId={vendor.id} />
        </div>
      </div>

      {/* Bilgi Alanı */}
      <div className="flex flex-1 flex-col">
        {/* Üst Kısım: Başlık + Rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {vendor.business_name}
            </h2>
            {/* Konum */}
            {(vendor.city?.name || vendor.district?.name) && (
              <p className="mt-0.5 text-sm text-slate-500">
                📍{" "}
                {[vendor.district?.name, vendor.city?.name]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Rating Badge */}
          {hasRating && (
            <div className="shrink-0 text-right">
              <div className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-white">
                <span className="text-sm font-bold">
                  {Number(rating.avg_rating).toFixed(1)}
                </span>
              </div>
              {rating.review_count && rating.review_count > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {rating.review_count} yorum
                </p>
              )}
            </div>
          )}
        </div>

        {/* Özellik İkonları */}
        {features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {features.map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {feature.icon} {feature.label}
              </span>
            ))}
          </div>
        )}

        {/* Açıklama */}
        {vendor.description && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">
            {vendor.description}
          </p>
        )}

        {/* Alt Kısım: Fiyat */}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <div>
              {typeof vendor.avg_price_per_person === "number" && (
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    ₺{Math.round(vendor.avg_price_per_person)}
                  </span>
                  <span className="text-sm text-slate-500"> / kişi</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-blue-600 group-hover:underline">
              Detayları Gör →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
