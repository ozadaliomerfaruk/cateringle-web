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

interface FilterSidebarProps {
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  serviceGroups: ServiceGroup[];
  currentParams: {
    city?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    min_guest?: string;
    max_guest?: string;
    category?: string;
    services?: string;
  };
}

export default function FilterSidebar({
  cities,
  districts,
  serviceGroups,
  currentParams,
}: FilterSidebarProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

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

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(
      buildFilterUrl({ city: e.target.value || undefined, district: undefined })
    );
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildFilterUrl({ district: e.target.value || undefined }));
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

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    router.push(
      buildFilterUrl({
        min_price: (formData.get("min_price") as string) || undefined,
        max_price: (formData.get("max_price") as string) || undefined,
        min_guest: (formData.get("min_guest") as string) || undefined,
        max_guest: (formData.get("max_guest") as string) || undefined,
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
    currentParams.services;

  return (
    <div className="space-y-6">
      {/* Temel Filtreler */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <svg
            className="h-5 w-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtreler
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Şehir */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Şehir
            </label>
            <select
              name="city"
              defaultValue={currentParams.city || ""}
              onChange={handleCityChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tüm şehirler</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* İlçe */}
          {districts.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                İlçe
              </label>
              <select
                name="district"
                defaultValue={currentParams.district || ""}
                onChange={handleDistrictChange}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tüm ilçeler</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fiyat */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kişi Başı Fiyat (TL)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="min_price"
                placeholder="Min"
                defaultValue={currentParams.min_price || ""}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="number"
                name="max_price"
                placeholder="Max"
                defaultValue={currentParams.max_price || ""}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Kişi Sayısı */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kişi Sayısı
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="min_guest"
                placeholder="Min"
                defaultValue={currentParams.min_guest || ""}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="number"
                name="max_guest"
                placeholder="Max"
                defaultValue={currentParams.max_guest || ""}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Uygula
          </button>

          {hasFilters && (
            <Link
              href="/vendors"
              className="block text-center text-sm text-slate-500 hover:text-emerald-600"
            >
              Filtreleri temizle
            </Link>
          )}
        </form>
      </div>

      {/* Hizmet Filtreleri */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <svg
            className="h-5 w-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Ek Hizmetler
        </h3>

        <div className="mt-4 space-y-2">
          {serviceGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);
            const groupSelectedCount = group.services.filter((s) =>
              selectedServices.includes(s.slug)
            ).length;

            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span>{group.icon}</span>
                    {group.name}
                    {groupSelectedCount > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {groupSelectedCount}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
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

                {isExpanded && (
                  <div className="space-y-1 bg-white p-3">
                    {group.services.map((service) => (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.slug)}
                          onChange={() => handleServiceToggle(service.slug)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">
                          {service.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
