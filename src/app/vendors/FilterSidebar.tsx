"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ServiceGroup {
  id: number;
  name: string;
  icon: string | null;
  services: { id: number; name: string; slug: string }[];
}

interface CuisineType {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  icon: string | null;
}

interface DeliveryModel {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface TagGroup {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  group_id: number;
  icon: string | null;
}

interface PopularFilter {
  id: number;
  filter_type: string;
  filter_key: string;
  label: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

interface FilterSidebarProps {
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  serviceGroups: ServiceGroup[];
  cuisineTypes: CuisineType[];
  deliveryModels: DeliveryModel[];
  tagGroups: TagGroup[];
  tags: Tag[];
  popularFilters: PopularFilter[];
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
    cuisines?: string;
    delivery_models?: string;
    tags?: string;
    lead_time?: string;
    available_24_7?: string;
    has_refrigerated?: string;
    serves_outside_city?: string;
    halal_certified?: string;
    free_tasting?: string;
    free_delivery?: string;
    accepts_last_minute?: string;
  };
}

// Accordion bileşeni
function FilterAccordion({
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
    <div className="border-b border-slate-200 py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${
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
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

// Checkbox bileşeni
function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 hover:bg-slate-50 -mx-2 px-2 rounded">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="flex-1 text-sm text-slate-700">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">{count}</span>
      )}
    </label>
  );
}

export default function FilterSidebar({
  cities,
  districts,
  serviceGroups,
  cuisineTypes,
  deliveryModels,
  tagGroups,
  tags,
  popularFilters,
  currentParams,
}: FilterSidebarProps) {
  const router = useRouter();

  const selectedServices = currentParams.services?.split(",") || [];
  const selectedCuisines = currentParams.cuisines?.split(",") || [];
  const selectedDeliveryModels =
    currentParams.delivery_models?.split(",") || [];
  const selectedTags = currentParams.tags?.split(",") || [];

  function buildFilterUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...currentParams, ...newParams };
    const searchParams = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const queryString = searchParams.toString();
    return `/vendors${queryString ? `?${queryString}` : ""}`;
  }

  const toggleArrayFilter = (
    currentArray: string[],
    slug: string,
    paramName: string
  ) => {
    const newArray = currentArray.includes(slug)
      ? currentArray.filter((s) => s !== slug)
      : [...currentArray, slug];
    router.push(
      buildFilterUrl({
        [paramName]: newArray.length ? newArray.join(",") : undefined,
      })
    );
  };

  // Populer filtre tiplerine gore render
  const renderPopularFilter = (filter: PopularFilter) => {
    if (filter.filter_type === "boolean") {
      // Boolean filtre (vendors tablosundaki kolon)
      const isChecked =
        currentParams[filter.filter_key as keyof typeof currentParams] ===
        "true";
      return (
        <FilterCheckbox
          key={filter.id}
          label={`${filter.icon || ""} ${filter.label}`.trim()}
          checked={isChecked}
          onChange={() =>
            router.push(
              buildFilterUrl({
                [filter.filter_key]: isChecked ? undefined : "true",
              })
            )
          }
        />
      );
    } else if (filter.filter_type === "cuisine") {
      // Mutfak turu filtresi
      return (
        <FilterCheckbox
          key={filter.id}
          label={`${filter.icon || ""} ${filter.label}`.trim()}
          checked={selectedCuisines.includes(filter.filter_key)}
          onChange={() =>
            toggleArrayFilter(selectedCuisines, filter.filter_key, "cuisines")
          }
        />
      );
    } else if (filter.filter_type === "delivery_model") {
      // Teslimat modeli filtresi
      return (
        <FilterCheckbox
          key={filter.id}
          label={`${filter.icon || ""} ${filter.label}`.trim()}
          checked={selectedDeliveryModels.includes(filter.filter_key)}
          onChange={() =>
            toggleArrayFilter(
              selectedDeliveryModels,
              filter.filter_key,
              "delivery_models"
            )
          }
        />
      );
    } else if (filter.filter_type === "tag") {
      // Etiket filtresi
      return (
        <FilterCheckbox
          key={filter.id}
          label={`${filter.icon || ""} ${filter.label}`.trim()}
          checked={selectedTags.includes(filter.filter_key)}
          onChange={() =>
            toggleArrayFilter(selectedTags, filter.filter_key, "tags")
          }
        />
      );
    }
    return null;
  };

  return (
    <div className="divide-y divide-slate-200">
      {/* Filtreleri Temizle */}
      {(currentParams.city ||
        currentParams.district ||
        currentParams.services ||
        currentParams.cuisines ||
        currentParams.delivery_models ||
        currentParams.tags ||
        currentParams.available_24_7 ||
        currentParams.has_refrigerated ||
        currentParams.serves_outside_city ||
        currentParams.halal_certified ||
        currentParams.free_tasting ||
        currentParams.free_delivery ||
        currentParams.accepts_last_minute ||
        currentParams.min_price ||
        currentParams.max_price) && (
        <div className="pb-4">
          <button
            onClick={() => router.push("/vendors")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Filtreleri temizle
          </button>
        </div>
      )}

      {/* Populer Filtreler */}
      {popularFilters.length > 0 && (
        <div className="py-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Populer filtreler
          </h3>
          <div className="space-y-1">
            {popularFilters.map((filter) => renderPopularFilter(filter))}
          </div>
        </div>
      )}

      {/* Hizmet Bolgesi */}
      <FilterAccordion title="Hizmet bolgesi" defaultOpen={true}>
        <div className="space-y-3">
          {/* Sehir Secimi */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Sehir
            </label>
            <select
              value={currentParams.city || ""}
              onChange={(e) =>
                router.push(
                  buildFilterUrl({
                    city: e.target.value || undefined,
                    district: undefined, // Şehir değişince ilçeyi sıfırla
                  })
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tum sehirler</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id.toString()}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ilce Secimi - Sadece sehir seciliyse goster */}
          {currentParams.city && districts.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Ilce
              </label>
              <select
                value={currentParams.district || ""}
                onChange={(e) =>
                  router.push(
                    buildFilterUrl({
                      district: e.target.value || undefined,
                    })
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Tum ilceler</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id.toString()}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bilgi notu */}
          <p className="text-xs text-slate-500">
            Sectiginiz bolgeye hizmet veren firmalar listelenir
          </p>
        </div>
      </FilterAccordion>

      {/* Kişi Sayısı */}
      <FilterAccordion title="Kişi sayısı" defaultOpen={false}>
        <div className="space-y-1">
          {[
            { label: "1-25 kişi", min: "1", max: "25" },
            { label: "26-50 kişi", min: "26", max: "50" },
            { label: "51-100 kişi", min: "51", max: "100" },
            { label: "101-250 kişi", min: "101", max: "250" },
            { label: "250+ kişi", min: "250", max: "" },
          ].map((range) => (
            <FilterCheckbox
              key={range.label}
              label={range.label}
              checked={
                currentParams.min_guest === range.min &&
                (currentParams.max_guest === range.max ||
                  (!currentParams.max_guest && !range.max))
              }
              onChange={() => {
                const isActive =
                  currentParams.min_guest === range.min &&
                  (currentParams.max_guest === range.max ||
                    (!currentParams.max_guest && !range.max));
                if (isActive) {
                  router.push(
                    buildFilterUrl({
                      min_guest: undefined,
                      max_guest: undefined,
                    })
                  );
                } else {
                  router.push(
                    buildFilterUrl({
                      min_guest: range.min,
                      max_guest: range.max || undefined,
                    })
                  );
                }
              }}
            />
          ))}
        </div>
      </FilterAccordion>

      {/* Teslimat Şekli */}
      {deliveryModels.length > 0 && (
        <FilterAccordion title="Teslimat şekli" defaultOpen={false}>
          <div className="space-y-1">
            {deliveryModels.map((model) => (
              <FilterCheckbox
                key={model.id}
                label={`${model.icon || "📦"} ${model.name}`}
                checked={selectedDeliveryModels.includes(model.slug)}
                onChange={() =>
                  toggleArrayFilter(
                    selectedDeliveryModels,
                    model.slug,
                    "delivery_models"
                  )
                }
              />
            ))}
          </div>
        </FilterAccordion>
      )}

      {/* Mutfak Türü */}
      {cuisineTypes.length > 0 && (
        <FilterAccordion title="Mutfak türü" defaultOpen={false}>
          <div className="space-y-1">
            {cuisineTypes.map((cuisine) => (
              <FilterCheckbox
                key={cuisine.id}
                label={`${cuisine.icon || "🍽️"} ${cuisine.name}`}
                checked={selectedCuisines.includes(cuisine.slug)}
                onChange={() =>
                  toggleArrayFilter(selectedCuisines, cuisine.slug, "cuisines")
                }
              />
            ))}
          </div>
        </FilterAccordion>
      )}

      {/* Hizmetler */}
      {serviceGroups.map((group) => (
        <FilterAccordion key={group.id} title={group.name} defaultOpen={false}>
          <div className="space-y-1">
            {group.services.map((service) => (
              <FilterCheckbox
                key={service.id}
                label={service.name}
                checked={selectedServices.includes(service.slug)}
                onChange={() =>
                  toggleArrayFilter(selectedServices, service.slug, "services")
                }
              />
            ))}
          </div>
        </FilterAccordion>
      ))}

      {/* Etiketler */}
      {tagGroups.map((group) => {
        const groupTags = tags.filter((t) => t.group_id === group.id);
        if (groupTags.length === 0) return null;
        return (
          <FilterAccordion
            key={group.id}
            title={group.name}
            defaultOpen={false}
          >
            <div className="space-y-1">
              {groupTags.map((tag) => (
                <FilterCheckbox
                  key={tag.id}
                  label={`${tag.icon || ""} ${tag.name}`}
                  checked={selectedTags.includes(tag.slug)}
                  onChange={() =>
                    toggleArrayFilter(selectedTags, tag.slug, "tags")
                  }
                />
              ))}
            </div>
          </FilterAccordion>
        );
      })}
    </div>
  );
}
// src/app/vendors/FilterSidebar.tsx
