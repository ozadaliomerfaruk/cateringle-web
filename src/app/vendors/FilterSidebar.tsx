"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ServiceGroup {
  id: number;
  name: string;
  icon: string | null;
  services: { id: number; name: string; slug: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface FilterSidebarProps {
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  serviceGroups: ServiceGroup[];
  categories?: Category[];
  currentParams: {
    city?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    min_guest?: string;
    max_guest?: string;
    category?: string;
    services?: string;
    segment?: string;
  };
}

// Accordion Section Component
function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  cities,
  districts,
  serviceGroups,
  categories = [],
  currentParams,
}: FilterSidebarProps) {
  const router = useRouter();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const selectedServices = currentParams.services
    ? currentParams.services.split(",")
    : [];

  function buildFilterUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...currentParams, ...newParams };
    const searchParams = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const queryString = searchParams.toString();
    return `/vendors${queryString ? `?${queryString}` : ""}`;
  }

  const handleCityChange = (cityId: string) => {
    router.push(
      buildFilterUrl({ city: cityId || undefined, district: undefined })
    );
  };

  const handleDistrictChange = (districtId: string) => {
    router.push(buildFilterUrl({ district: districtId || undefined }));
  };

  const handleServiceToggle = (serviceSlug: string) => {
    let newServices: string[];
    if (selectedServices.includes(serviceSlug)) {
      newServices = selectedServices.filter((s) => s !== serviceSlug);
    } else {
      newServices = [...selectedServices, serviceSlug];
    }
    router.push(
      buildFilterUrl({
        services: newServices.length > 0 ? newServices.join(",") : undefined,
      })
    );
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategory =
      currentParams.category === categorySlug ? undefined : categorySlug;
    router.push(buildFilterUrl({ category: newCategory }));
  };

  const handleGuestChange = (min: string, max: string) => {
    router.push(
      buildFilterUrl({
        min_guest: min || undefined,
        max_guest: max || undefined,
      })
    );
  };

  const hasFilters =
    currentParams.city ||
    currentParams.district ||
    currentParams.min_price ||
    currentParams.max_price ||
    currentParams.min_guest ||
    currentParams.max_guest ||
    currentParams.services ||
    currentParams.category;

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 6);

  return (
    <div className="space-y-0">
      {/* Clear Filters */}
      {hasFilters && (
        <div className="border-b border-slate-200 pb-4">
          <Link
            href={
              currentParams.segment
                ? `/vendors?segment=${currentParams.segment}`
                : "/vendors"
            }
            className="text-sm font-medium text-leaf-600 hover:text-leaf-700"
          >
            Filtreleri Temizle
          </Link>
        </div>
      )}

      {/* Teslimat Şekli / Konum */}
      <FilterSection title="Konum" defaultOpen={true}>
        <div className="space-y-3">
          <select
            value={currentParams.city || ""}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full border border-slate-200 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
          >
            <option value="">Tüm Şehirler</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {districts.length > 0 && (
            <select
              value={currentParams.district || ""}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full border border-slate-200 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
            >
              <option value="">Tüm İlçeler</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </FilterSection>

      {/* Etkinlik Türü / Kategoriler */}
      {categories.length > 0 && (
        <FilterSection title="Etkinlik Türü" defaultOpen={true}>
          <div className="space-y-2">
            {displayedCategories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-3 py-1"
              >
                <input
                  type="checkbox"
                  checked={currentParams.category === category.slug}
                  onChange={() => handleCategoryToggle(category.slug)}
                  className="h-4 w-4 border-slate-300 text-leaf-600 focus:ring-leaf-500"
                />
                <span className="text-sm text-slate-700">{category.name}</span>
              </label>
            ))}
            {categories.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-2 text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                {showAllCategories
                  ? "Daha az göster"
                  : `+${categories.length - 6} daha fazla göster`}
              </button>
            )}
          </div>
        </FilterSection>
      )}

      {/* Mutfak Türü / Hizmetler */}
      {serviceGroups.map((group) => (
        <FilterSection key={group.id} title={group.name}>
          <div className="space-y-2">
            {group.services
              .slice(0, showAllCategories ? undefined : 5)
              .map((service) => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center gap-3 py-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.slug)}
                    onChange={() => handleServiceToggle(service.slug)}
                    className="h-4 w-4 border-slate-300 text-leaf-600 focus:ring-leaf-500"
                  />
                  <span className="text-sm text-slate-700">{service.name}</span>
                </label>
              ))}
            {group.services.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-1 text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                {showAllCategories ? "Daha az göster" : "Daha fazla göster"}
              </button>
            )}
          </div>
        </FilterSection>
      ))}

      {/* Kişi Sayısı */}
      <FilterSection title="Kişi Sayısı">
        <div className="space-y-2">
          {[
            { label: "1-25 kişi", min: "1", max: "25" },
            { label: "26-50 kişi", min: "26", max: "50" },
            { label: "51-100 kişi", min: "51", max: "100" },
            { label: "101-250 kişi", min: "101", max: "250" },
            { label: "250+ kişi", min: "250", max: "" },
          ].map((range) => (
            <label
              key={range.label}
              className="flex cursor-pointer items-center gap-3 py-1"
            >
              <input
                type="checkbox"
                checked={
                  currentParams.min_guest === range.min &&
                  currentParams.max_guest === range.max
                }
                onChange={() => {
                  if (
                    currentParams.min_guest === range.min &&
                    currentParams.max_guest === range.max
                  ) {
                    handleGuestChange("", "");
                  } else {
                    handleGuestChange(range.min, range.max);
                  }
                }}
                className="h-4 w-4 border-slate-300 text-leaf-600 focus:ring-leaf-500"
              />
              <span className="text-sm text-slate-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fiyat Aralığı */}
      <FilterSection title="Fiyat Aralığı (TL/kişi)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentParams.min_price || ""}
            onBlur={(e) =>
              router.push(
                buildFilterUrl({ min_price: e.target.value || undefined })
              )
            }
            className="w-full border border-slate-200 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentParams.max_price || ""}
            onBlur={(e) =>
              router.push(
                buildFilterUrl({ max_price: e.target.value || undefined })
              )
            }
            className="w-full border border-slate-200 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
          />
        </div>
      </FilterSection>
    </div>
  );
}
