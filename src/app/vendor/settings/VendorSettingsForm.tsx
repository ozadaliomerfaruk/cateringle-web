"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import ImageUpload from "../../../components/ImageUpload";
import GalleryUpload from "../../../components/GalleryUpload";
import type { Database } from "@/types/database";

// Tip tanımları
type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

interface Segment {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  segment_id: number | null;
}

interface VendorSettingsFormProps {
  vendor: Vendor;
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  segments: Segment[];
  selectedSegmentIds: number[];
  categories: Category[];
  selectedCategoryIds: number[];
  serviceGroups: {
    id: number;
    name: string;
    icon: string | null;
    services: { id: number; name: string; slug: string }[];
  }[];
  selectedServiceIds: number[];
  images: { id: string; image_url: string; sort_order: number | null }[];
}

export default function VendorSettingsForm({
  vendor,
  cities,
  districts: initialDistricts,
  segments,
  selectedSegmentIds,
  categories,
  selectedCategoryIds,
  serviceGroups,
  selectedServiceIds,
  images,
}: VendorSettingsFormProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [districts, setDistricts] = useState(initialDistricts);
  const [activeTab, setActiveTab] = useState("general");

  // Form state
  const [formData, setFormData] = useState({
    business_name: vendor.business_name || "",
    description: vendor.description || "",
    phone: vendor.phone || "",
    whatsapp: vendor.whatsapp || "",
    email: vendor.email || "",
    website_url: vendor.website_url || "",
    address_text: vendor.address_text || "",
    city_id: vendor.city_id?.toString() || "",
    district_id: vendor.district_id?.toString() || "",
    avg_price_per_person: vendor.avg_price_per_person?.toString() || "",
    min_guest_count: vendor.min_guest_count?.toString() || "",
    max_guest_count: vendor.max_guest_count?.toString() || "",
    logo_url: vendor.logo_url || "",
  });

  const [selectedSegments, setSelectedSegments] =
    useState<number[]>(selectedSegmentIds);
  const [selectedCategories, setSelectedCategories] =
    useState<number[]>(selectedCategoryIds);
  const [selectedServices, setSelectedServices] =
    useState<number[]>(selectedServiceIds);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  // Şehir değişince ilçeleri güncelle
  const fetchDistricts = useCallback(
    async (cityId: string) => {
      const { data } = await supabase
        .from("districts")
        .select("id, name")
        .eq("city_id", parseInt(cityId, 10))
        .order("name");
      setDistricts(data || []);
    },
    [supabase]
  );

  useEffect(() => {
    if (formData.city_id) {
      fetchDistricts(formData.city_id);
    } else {
      setDistricts([]);
    }
  }, [formData.city_id, fetchDistricts]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const toggleSegment = (segmentId: number) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Segment'e göre filtrelenmiş kategoriler
  const filteredCategories = categories.filter(
    (cat) => !cat.segment_id || selectedSegments.includes(cat.segment_id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Vendor güncelle
      const { error: vendorError } = await supabase
        .from("vendors")
        .update({
          business_name: formData.business_name,
          description: formData.description || null,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          email: formData.email || null,
          website_url: formData.website_url || null,
          address_text: formData.address_text || null,
          city_id: formData.city_id ? parseInt(formData.city_id, 10) : null,
          district_id: formData.district_id
            ? parseInt(formData.district_id, 10)
            : null,
          avg_price_per_person: formData.avg_price_per_person
            ? parseFloat(formData.avg_price_per_person)
            : null,
          min_guest_count: formData.min_guest_count
            ? parseInt(formData.min_guest_count, 10)
            : null,
          max_guest_count: formData.max_guest_count
            ? parseInt(formData.max_guest_count, 10)
            : null,
          logo_url: formData.logo_url || null,
        })
        .eq("id", vendor.id);

      if (vendorError) throw vendorError;

      // Segmentleri güncelle
      await supabase
        .from("vendor_segments")
        .delete()
        .eq("vendor_id", vendor.id);
      if (selectedSegments.length > 0) {
        await supabase.from("vendor_segments").insert(
          selectedSegments.map((segmentId) => ({
            vendor_id: vendor.id,
            segment_id: segmentId,
          }))
        );
      }

      // Kategorileri güncelle
      await supabase
        .from("vendor_categories")
        .delete()
        .eq("vendor_id", vendor.id);
      if (selectedCategories.length > 0) {
        await supabase.from("vendor_categories").insert(
          selectedCategories.map((categoryId) => ({
            vendor_id: vendor.id,
            category_id: categoryId,
          }))
        );
      }

      // Hizmetleri güncelle
      await supabase
        .from("vendor_services")
        .delete()
        .eq("vendor_id", vendor.id);
      if (selectedServices.length > 0) {
        await supabase.from("vendor_services").insert(
          selectedServices.map((serviceId) => ({
            vendor_id: vendor.id,
            service_id: serviceId,
          }))
        );
      }

      setMessage({ type: "success", text: "Değişiklikler kaydedildi!" });
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bir hata oluştu";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "general",
      label: "Genel Bilgiler",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "contact",
      label: "İletişim",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      id: "segments",
      label: "Müşteri Tipi",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "categories",
      label: "Kategoriler",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "services",
      label: "Hizmetler",
      icon: (
        <svg
          className="h-5 w-5"
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
      ),
    },
    {
      id: "media",
      label: "Medya",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Mesaj */}
      {message && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Genel Bilgiler */}
        {activeTab === "general" && (
          <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Firma Adı
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Firma Tanıtımı
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Firmanızı kısaca tanıtın..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Kişi Başı Ortalama Fiyat (TL)
                </label>
                <input
                  type="number"
                  name="avg_price_per_person"
                  value={formData.avg_price_per_person}
                  onChange={handleChange}
                  placeholder="150"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Min. Kişi Sayısı
                </label>
                <input
                  type="number"
                  name="min_guest_count"
                  value={formData.min_guest_count}
                  onChange={handleChange}
                  placeholder="20"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Max. Kişi Sayısı
                </label>
                <input
                  type="number"
                  name="max_guest_count"
                  value={formData.max_guest_count}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* İletişim */}
        {activeTab === "contact" && (
          <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@firmaniz.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Web Sitesi
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://firmaniz.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Şehir
                </label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  İlçe
                </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  disabled={!formData.city_id}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                >
                  <option value="">İlçe seçin</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Açık Adres
              </label>
              <textarea
                name="address_text"
                value={formData.address_text}
                onChange={handleChange}
                rows={2}
                placeholder="Açık adres..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        )}

        {/* Müşteri Tipi / Segmentler */}
        {activeTab === "segments" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm text-slate-600">
              Hangi müşteri tiplerine hizmet verdiğinizi seçin. Bu seçim,
              firmanızın doğru müşterilere gösterilmesini sağlar.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => toggleSegment(segment.id)}
                  className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                    selectedSegments.includes(segment.id)
                      ? segment.slug === "kurumsal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                      selectedSegments.includes(segment.id)
                        ? segment.slug === "kurumsal"
                          ? "bg-blue-100"
                          : "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {segment.slug === "kurumsal" ? "🏢" : "🎉"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {segment.name}
                      </span>
                      {selectedSegments.includes(segment.id) && (
                        <svg
                          className={`h-5 w-5 ${
                            segment.slug === "kurumsal"
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {segment.slug === "kurumsal"
                        ? "Ofis yemekleri, toplantı ikramları, kurumsal etkinlikler"
                        : "Düğün, doğum günü, ev partisi, özel kutlamalar"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Her iki müşteri tipini de seçebilirsiniz.
            </p>
          </div>
        )}

        {/* Kategoriler */}
        {activeTab === "categories" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedSegments.length === 0 ? (
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-amber-700">
                  Önce &quot;Müşteri Tipi&quot; sekmesinden en az bir segment
                  seçin.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  Firmanızın hizmet verdiği etkinlik türlerini seçin.
                </p>

                {/* Kurumsal Kategoriler */}
                {selectedSegments.some(
                  (id) => segments.find((s) => s.id === id)?.slug === "kurumsal"
                ) && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-sm">
                        🏢
                      </span>
                      Kurumsal Kategoriler
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {filteredCategories
                        .filter(
                          (c) =>
                            c.segment_id ===
                            segments.find((s) => s.slug === "kurumsal")?.id
                        )
                        .map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                              selectedCategories.includes(category.id)
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-2xl">
                              {category.icon || "📁"}
                            </span>
                            <span className="mt-2 text-center text-sm font-medium">
                              {category.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Bireysel Kategoriler */}
                {selectedSegments.some(
                  (id) => segments.find((s) => s.id === id)?.slug === "bireysel"
                ) && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-sm">
                        🎉
                      </span>
                      Bireysel Kategoriler
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {filteredCategories
                        .filter(
                          (c) =>
                            c.segment_id ===
                            segments.find((s) => s.slug === "bireysel")?.id
                        )
                        .map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                              selectedCategories.includes(category.id)
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-2xl">
                              {category.icon || "📁"}
                            </span>
                            <span className="mt-2 text-center text-sm font-medium">
                              {category.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Hizmetler */}
        {activeTab === "services" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm text-slate-600">
              Sunduğunuz ek hizmetleri seçin.
            </p>
            <div className="space-y-3">
              {serviceGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                const groupSelectedCount = group.services.filter((s) =>
                  selectedServices.includes(s.id)
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
                      <span className="flex items-center gap-2 font-medium">
                        {group.icon ? (
                          <span>{group.icon}</span>
                        ) : (
                          <svg
                            className="h-5 w-5 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        )}
                        {group.name}
                        {groupSelectedCount > 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            {groupSelectedCount}
                          </span>
                        )}
                      </span>
                      <svg
                        className={`h-5 w-5 text-slate-400 transition-transform ${
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
                      <div className="grid gap-2 p-4 sm:grid-cols-2">
                        {group.services.map((service) => (
                          <label
                            key={service.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => toggleService(service.id)}
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
        )}

        {/* Medya */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Firma Logosu
              </h3>
              <ImageUpload
                vendorId={vendor.id}
                currentImageUrl={formData.logo_url}
                type="logo"
                onUploadComplete={(url: string) =>
                  setFormData((prev) => ({ ...prev, logo_url: url }))
                }
              />
            </div>

            {/* Galeri */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Fotoğraf Galerisi
              </h3>
              <GalleryUpload vendorId={vendor.id} images={images} />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
