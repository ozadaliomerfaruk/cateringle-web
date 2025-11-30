// src/app/components/VendorFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type City = {
  id: number;
  name: string;
  slug: string;
};

type District = {
  id: number;
  name: string;
  slug: string;
};

interface VendorFiltersProps {
  cities: City[];
  initialDistricts: District[];
}

export default function VendorFilters({
  cities,
  initialDistricts,
}: VendorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const currentCity = searchParams.get("city") || "";
  const currentDistrict = searchParams.get("district") || "";
  const currentMinGuests = searchParams.get("minGuests") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const activeFilters = [
    currentCity,
    currentDistrict,
    currentMinGuests,
    currentMaxPrice,
  ].filter(Boolean).length;

  // İlçeleri yükle
  const fetchDistricts = useCallback(async (cityId: string) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    try {
      const res = await fetch(`/api/districts?cityId=${cityId}`);
      if (!res.ok) throw new Error("Failed to fetch districts");
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("İlçeler yüklenemedi:", error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // URL'deki şehir değiştiğinde ilçeleri yükle (sayfa yenilendiğinde de çalışır)
  useEffect(() => {
    // Eğer initialDistricts boşsa ve currentCity varsa, fetch et
    if (currentCity && initialDistricts.length === 0) {
      fetchDistricts(currentCity);
    }
  }, [currentCity, initialDistricts.length, fetchDistricts]);

  // Şehir değiştiğinde
  const handleCityChange = async (cityId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (cityId) {
      params.set("city", cityId);
    } else {
      params.delete("city");
    }
    params.delete("district"); // İlçeyi sıfırla

    router.push(`/vendors?${params.toString()}`);

    // İlçeleri fetch et
    await fetchDistricts(cityId);
  };

  const handleDistrictChange = (districtId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (districtId) {
      params.set("district", districtId);
    } else {
      params.delete("district");
    }

    router.push(`/vendors?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const city = formData.get("city") as string;
    const district = formData.get("district") as string;
    const minGuests = formData.get("minGuests") as string;
    const maxPrice = formData.get("maxPrice") as string;

    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (minGuests) params.set("minGuests", minGuests);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/vendors?${params.toString()}`);
  };

  const handleClear = () => {
    setDistricts([]);
    router.push("/vendors");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky top-4 space-y-4 rounded-lg border bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Filtreler</h2>
        {activeFilters > 0 && (
          <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-medium text-leaf-700">
            {activeFilters} aktif
          </span>
        )}
      </div>

      {/* Şehir */}
      <div>
        <label
          htmlFor="city-filter"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          Şehir
        </label>
        <select
          id="city-filter"
          name="city"
          value={currentCity}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500"
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
      <div>
        <label
          htmlFor="district-filter"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          İlçe
        </label>
        <select
          id="district-filter"
          name="district"
          value={currentDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!currentCity || loadingDistricts}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">Tüm ilçeler</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
        {loadingDistricts && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <svg
              className="h-3 w-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Yükleniyor...
          </div>
        )}
      </div>

      {/* Kişi Sayısı */}
      <div>
        <label
          htmlFor="minGuests-filter"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          Minimum Kişi Sayısı
        </label>
        <input
          id="minGuests-filter"
          type="number"
          name="minGuests"
          min="1"
          defaultValue={currentMinGuests}
          placeholder="Örn: 50"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500"
        />
      </div>

      {/* Max Fiyat */}
      <div>
        <label
          htmlFor="maxPrice-filter"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          Maks. Kişi Başı Fiyat (TL)
        </label>
        <input
          id="maxPrice-filter"
          type="number"
          name="maxPrice"
          min="0"
          defaultValue={currentMaxPrice}
          placeholder="Örn: 500"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500"
        />
      </div>

      {/* Butonlar */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-700"
        >
          Filtrele
        </button>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            Temizle
          </button>
        )}
      </div>
    </form>
  );
}
