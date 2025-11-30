"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import FavoriteButton from "../../components/FavoriteButton";

interface VendorCardProps {
  vendor: {
    id: number | string;
    business_name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    avg_price_per_person: number | null;
    min_guest_count: number | null;
    max_guest_count: number | null;
    city: { name: string } | null;
    district: { name: string } | null;
    vendor_ratings:
      | { avg_rating: number | null; review_count: number | null }[]
      | null;
  };
  cuisineTypes?: string[];
}

export default function VendorCard({
  vendor,
  cuisineTypes = [],
}: VendorCardProps) {
  const [activeTab, setActiveTab] = useState(0);

  const rating = vendor.vendor_ratings?.[0];
  const hasRating = rating && rating.avg_rating !== null;

  // Demo cuisine types if not provided
  const tabs =
    cuisineTypes.length > 0
      ? cuisineTypes
      : ["Türk Mutfağı", "Dünya Mutfağı", "Vejeteryan"];

  return (
    <div className="group relative border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-lg">
      {/* Favorite Button */}
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton vendorId={String(vendor.id)} />
      </div>

      {/* Header Area */}
      <div className="p-4 pb-3">
        <h3 className="pr-10 text-lg font-bold text-slate-900 group-hover:text-leaf-600">
          {vendor.business_name}
        </h3>
        {vendor.description && (
          <p className="mt-1 truncate text-sm text-slate-500">
            {vendor.description}
          </p>
        )}
      </div>

      {/* Hero Image */}
      <div className="aspect-video overflow-hidden bg-slate-100">
        {vendor.logo_url ? (
          <Image
            src={vendor.logo_url}
            alt={vendor.business_name}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-leaf-50 to-leaf-100">
            <span className="text-5xl font-bold text-leaf-300">
              {vendor.business_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(index);
            }}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === index
                ? "border-b-2 border-leaf-500 text-leaf-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info Area */}
      <Link href={`/vendors/${vendor.slug}`} className="block p-4">
        {/* Location & Rating */}
        <div className="flex items-center justify-between">
          {(vendor.city?.name || vendor.district?.name) && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
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
          {hasRating && (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1">
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
              {rating.review_count && rating.review_count > 0 && (
                <span className="text-xs text-slate-400">
                  ({rating.review_count})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Guest Info */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {typeof vendor.avg_price_per_person === "number" && (
            <span className="inline-flex items-center gap-1 bg-leaf-50 px-2.5 py-1 text-sm font-medium text-leaf-700">
              {Math.round(vendor.avg_price_per_person)} TL/kişi
            </span>
          )}
          {vendor.min_guest_count && vendor.max_guest_count && (
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
              {vendor.min_guest_count}-{vendor.max_guest_count} kişi
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-leaf-600">
            Detayları Gör
          </span>
          <svg
            className="h-4 w-4 text-leaf-600 transition-transform group-hover:translate-x-1"
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
        </div>
      </Link>
    </div>
  );
}
