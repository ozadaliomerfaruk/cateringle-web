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

interface CuisineType {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number | null;
}

interface DeliveryModel {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number | null;
}

interface TagGroup {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  group_id: number;
  icon: string | null;
  sort_order: number | null;
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
  cuisineTypes: CuisineType[];
  selectedCuisineIds: number[];
  deliveryModels: DeliveryModel[];
  selectedDeliveryModelIds: number[];
  tagGroups: TagGroup[];
  tags: Tag[];
  selectedTagIds: number[];
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
  cuisineTypes,
  selectedCuisineIds,
  deliveryModels,
  selectedDeliveryModelIds,
  tagGroups,
  tags,
  selectedTagIds,
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
    // Yeni operasyonel alanlar
    lead_time_hours: vendor.lead_time_hours?.toString() || "",
    lead_time_type: vendor.lead_time_type || "standard",
    accepts_last_minute: vendor.accepts_last_minute || false,
    weekend_surcharge_percent:
      vendor.weekend_surcharge_percent?.toString() || "",
    holiday_surcharge_percent:
      vendor.holiday_surcharge_percent?.toString() || "",
    // Teslimat alanları
    delivery_pricing_type: vendor.delivery_pricing_type || "contact",
    delivery_base_fee: vendor.delivery_base_fee?.toString() || "",
    delivery_notes: vendor.delivery_notes || "",
    has_refrigerated_vehicle: vendor.has_refrigerated_vehicle || false,
    serves_outside_city: vendor.serves_outside_city || false,
    available_24_7: vendor.available_24_7 || false,
  });

  const [selectedSegments, setSelectedSegments] =
    useState<number[]>(selectedSegmentIds);
  const [selectedCategories, setSelectedCategories] =
    useState<number[]>(selectedCategoryIds);
  const [selectedServices, setSelectedServices] =
    useState<number[]>(selectedServiceIds);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  // Yeni kategori sistemi state'leri
  const [selectedCuisines, setSelectedCuisines] =
    useState<number[]>(selectedCuisineIds);
  const [selectedDeliveryModelsList, setSelectedDeliveryModelsList] = useState<
    number[]
  >(selectedDeliveryModelIds);
  const [selectedTags, setSelectedTags] = useState<number[]>(selectedTagIds);

  // Hizmet bölgeleri state'i
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<Set<number>>(
    new Set()
  );
  const [expandedCities, setExpandedCities] = useState<number[]>([]);
  const [cityDistrictsMap, setCityDistrictsMap] = useState<
    Record<number, { id: number; name: string }[]>
  >({});
  const [loadingCityDistricts, setLoadingCityDistricts] = useState<
    Record<number, boolean>
  >({});
  const [loadingServiceAreas, setLoadingServiceAreas] = useState(true);

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

  // Mevcut hizmet bölgelerini çek
  useEffect(() => {
    const fetchServiceAreas = async () => {
      setLoadingServiceAreas(true);
      const { data } = await supabase
        .from("vendor_service_areas")
        .select("district_id")
        .eq("vendor_id", vendor.id);

      if (data) {
        const districtIds = new Set<number>();
        data.forEach((item: { district_id: number | null }) => {
          if (item.district_id) {
            districtIds.add(item.district_id);
          }
        });
        setSelectedDistrictIds(districtIds);
      }
      setLoadingServiceAreas(false);
    };

    fetchServiceAreas();
  }, [supabase, vendor.id]);

  // Şehir accordion'u açıldığında ilçeleri getir
  const fetchCityDistricts = async (cityId: number) => {
    if (cityDistrictsMap[cityId]) return; // Zaten yüklüyse tekrar yükleme

    setLoadingCityDistricts((prev) => ({ ...prev, [cityId]: true }));
    const { data } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", cityId)
      .order("name");

    setCityDistrictsMap((prev) => ({ ...prev, [cityId]: data || [] }));
    setLoadingCityDistricts((prev) => ({ ...prev, [cityId]: false }));
  };

  // Şehir accordion toggle
  const toggleCityExpanded = (cityId: number) => {
    if (expandedCities.includes(cityId)) {
      setExpandedCities((prev) => prev.filter((id) => id !== cityId));
    } else {
      setExpandedCities((prev) => [...prev, cityId]);
      fetchCityDistricts(cityId); // İlçeleri yükle
    }
  };

  // İlçe checkbox toggle
  const toggleDistrictSelection = (districtId: number) => {
    setSelectedDistrictIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(districtId)) {
        newSet.delete(districtId);
      } else {
        newSet.add(districtId);
      }
      return newSet;
    });
  };

  // Şehirdeki tüm ilçeleri seç/kaldır
  const toggleAllDistrictsInCity = (cityId: number, select: boolean) => {
    const cityDistricts = cityDistrictsMap[cityId] || [];
    setSelectedDistrictIds((prev) => {
      const newSet = new Set(prev);
      cityDistricts.forEach((d) => {
        if (select) {
          newSet.add(d.id);
        } else {
          newSet.delete(d.id);
        }
      });
      return newSet;
    });
  };

  // Şehirdeki seçili ilçe sayısı
  const getSelectedCountInCity = (cityId: number): number => {
    const cityDistricts = cityDistrictsMap[cityId] || [];
    return cityDistricts.filter((d) => selectedDistrictIds.has(d.id)).length;
  };

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

  // Yeni toggle fonksiyonları
  const toggleCuisine = (cuisineId: number) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisineId)
        ? prev.filter((id) => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const toggleDeliveryModel = (modelId: number) => {
    setSelectedDeliveryModelsList((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Segment'e göre filtrelenmiş kategoriler
  const filteredCategories = categories.filter(
    (cat) => !cat.segment_id || selectedSegments.includes(cat.segment_id)
  );

  // Mutfak türlerini kategoriye göre grupla
  const cuisinesByCategory = cuisineTypes.reduce((acc, cuisine) => {
    const category = cuisine.category || "Diğer";
    if (!acc[category]) acc[category] = [];
    acc[category].push(cuisine);
    return acc;
  }, {} as Record<string, CuisineType[]>);

  const cuisineCategoryOrder = [
    "Türk / Yöresel",
    "Dünya Mutfakları",
    "Konsept / Özel",
  ];
  const sortedCuisineCategories = Object.keys(cuisinesByCategory).sort(
    (a, b) => cuisineCategoryOrder.indexOf(a) - cuisineCategoryOrder.indexOf(b)
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
          // Yeni operasyonel alanlar
          lead_time_hours: formData.lead_time_hours
            ? parseInt(formData.lead_time_hours, 10)
            : null,
          lead_time_type: formData.lead_time_type || null,
          accepts_last_minute: formData.accepts_last_minute,
          weekend_surcharge_percent: formData.weekend_surcharge_percent
            ? parseFloat(formData.weekend_surcharge_percent)
            : null,
          holiday_surcharge_percent: formData.holiday_surcharge_percent
            ? parseFloat(formData.holiday_surcharge_percent)
            : null,
          // Teslimat alanları
          delivery_pricing_type: formData.delivery_pricing_type || null,
          delivery_base_fee: formData.delivery_base_fee
            ? parseFloat(formData.delivery_base_fee)
            : null,
          delivery_notes: formData.delivery_notes || null,
          has_refrigerated_vehicle: formData.has_refrigerated_vehicle,
          serves_outside_city: formData.serves_outside_city,
          available_24_7: formData.available_24_7,
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

      // Mutfak türlerini güncelle
      await supabase
        .from("vendor_cuisines")
        .delete()
        .eq("vendor_id", vendor.id);
      if (selectedCuisines.length > 0) {
        await supabase.from("vendor_cuisines").insert(
          selectedCuisines.map((cuisineId) => ({
            vendor_id: vendor.id,
            cuisine_type_id: cuisineId,
          }))
        );
      }

      // Teslimat modellerini güncelle
      await supabase
        .from("vendor_delivery_models")
        .delete()
        .eq("vendor_id", vendor.id);
      if (selectedDeliveryModelsList.length > 0) {
        await supabase.from("vendor_delivery_models").insert(
          selectedDeliveryModelsList.map((modelId) => ({
            vendor_id: vendor.id,
            delivery_model_id: modelId,
          }))
        );
      }

      // Etiketleri güncelle
      await supabase.from("vendor_tags").delete().eq("vendor_id", vendor.id);
      if (selectedTags.length > 0) {
        await supabase.from("vendor_tags").insert(
          selectedTags.map((tagId) => ({
            vendor_id: vendor.id,
            tag_id: tagId,
          }))
        );
      }

      // Hizmet bölgelerini güncelle
      await supabase
        .from("vendor_service_areas")
        .delete()
        .eq("vendor_id", vendor.id);

      if (selectedDistrictIds.size > 0) {
        // İlçelerin city_id'lerini çek
        const districtIdsArray = Array.from(selectedDistrictIds);
        const { data: districtsWithCities } = await supabase
          .from("districts")
          .select("id, city_id")
          .in("id", districtIdsArray);

        if (districtsWithCities && districtsWithCities.length > 0) {
          await supabase.from("vendor_service_areas").insert(
            districtsWithCities.map((d) => ({
              vendor_id: vendor.id,
              city_id: d.city_id,
              district_id: d.id,
            }))
          );
        }
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
      id: "cuisine",
      label: "Mutfak",
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      id: "delivery",
      label: "Teslimat",
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
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      ),
    },
    {
      id: "tags",
      label: "Etiketler",
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: "service_areas",
      label: "Hizmet Bölgeleri",
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
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      id: "operational",
      label: "Operasyonel",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
          className={`mb-6 border border-slate-200 px-4 py-3 ${
            message.type === "success"
              ? "bg-leaf-50 text-leaf-700"
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
            className={`flex items-center gap-2 border border-slate-200 px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-leaf-600 text-white shadow-sm"
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
          <div className="space-y-6 border border-slate-200 bg-white p-6 shadow-sm">
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
                className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* İletişim */}
        {activeTab === "contact" && (
          <div className="space-y-6 border border-slate-200 bg-white p-6 shadow-sm">
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
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
                  className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20 disabled:opacity-50"
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
                className="w-full border border-slate-200 border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
              />
            </div>
          </div>
        )}

        {/* Müşteri Tipi / Segmentler */}
        {activeTab === "segments" && (
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
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
                  className={`flex items-start gap-4 border border-slate-200 border-2 p-5 text-left transition-all ${
                    selectedSegments.includes(segment.id)
                      ? segment.slug === "kurumsal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-emerald-500 bg-leaf-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center border border-slate-200 text-2xl ${
                      selectedSegments.includes(segment.id)
                        ? segment.slug === "kurumsal"
                          ? "bg-blue-100"
                          : "bg-leaf-100"
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
                              : "text-leaf-600"
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
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            {selectedSegments.length === 0 ? (
              <div className="border border-slate-200 bg-amber-50 p-4 text-center">
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
                            className={`flex flex-col items-center border border-slate-200 border-2 p-4 transition-all ${
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
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-leaf-100 text-sm">
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
                            className={`flex flex-col items-center border border-slate-200 border-2 p-4 transition-all ${
                              selectedCategories.includes(category.id)
                                ? "border-emerald-500 bg-leaf-50 text-leaf-700"
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
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
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
                    className="overflow-hidden border border-slate-200 border border-slate-200"
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
                          <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-semibold text-leaf-700">
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
                              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
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

        {/* Mutfak Türleri */}
        {activeTab === "cuisine" && (
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm text-slate-600">
              Sunduğunuz mutfak türlerini seçin. Bu bilgi müşterilerin sizi daha
              kolay bulmasını sağlar.
            </p>

            {sortedCuisineCategories.map((categoryName) => (
              <div key={categoryName} className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-orange-100 text-sm">
                    {categoryName === "Türk / Yöresel"
                      ? "🍖"
                      : categoryName === "Dünya Mutfakları"
                      ? "🌍"
                      : "✨"}
                  </span>
                  {categoryName}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {cuisinesByCategory[categoryName].map((cuisine) => (
                    <button
                      key={cuisine.id}
                      type="button"
                      onClick={() => toggleCuisine(cuisine.id)}
                      className={`flex flex-col items-center border border-slate-200 border-2 p-4 transition-all ${
                        selectedCuisines.includes(cuisine.id)
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{cuisine.icon || "🍽️"}</span>
                      <span className="mt-2 text-center text-sm font-medium">
                        {cuisine.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {selectedCuisines.length > 0 && (
              <div className="mt-4 rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700">
                <strong>{selectedCuisines.length}</strong> mutfak türü seçildi
              </div>
            )}
          </div>
        )}

        {/* Teslimat Modelleri */}
        {activeTab === "delivery" && (
          <div className="space-y-6">
            {/* Teslimat Modelleri Seçimi */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Teslimat Modelleri
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Sunduğunuz teslimat ve servis modellerini seçin.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {deliveryModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleDeliveryModel(model.id)}
                    className={`flex flex-col items-start border border-slate-200 border-2 p-4 text-left transition-all ${
                      selectedDeliveryModelsList.includes(model.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{model.icon || "📦"}</span>
                      <span
                        className={`font-medium ${
                          selectedDeliveryModelsList.includes(model.id)
                            ? "text-teal-700"
                            : "text-slate-700"
                        }`}
                      >
                        {model.name}
                      </span>
                    </div>
                    {model.description && (
                      <p className="mt-2 text-xs text-slate-500">
                        {model.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Teslimat Ücretlendirmesi */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Teslimat Ücretlendirmesi
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ücretlendirme Tipi
                  </label>
                  <select
                    name="delivery_pricing_type"
                    value={formData.delivery_pricing_type}
                    onChange={handleChange}
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  >
                    <option value="free">Ücretsiz</option>
                    <option value="fixed">Sabit Ücret</option>
                    <option value="per_km">KM Başına</option>
                    <option value="included">Fiyata Dahil</option>
                    <option value="contact">İletişime Geçin</option>
                  </select>
                </div>

                {(formData.delivery_pricing_type === "fixed" ||
                  formData.delivery_pricing_type === "per_km") && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {formData.delivery_pricing_type === "fixed"
                        ? "Sabit Ücret (₺)"
                        : "KM Başına Ücret (₺)"}
                    </label>
                    <input
                      type="number"
                      name="delivery_base_fee"
                      value={formData.delivery_base_fee}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Teslimat Notları
                  </label>
                  <textarea
                    name="delivery_notes"
                    value={formData.delivery_notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Teslimat hakkında ek bilgiler..."
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  />
                </div>
              </div>
            </div>

            {/* Lojistik Özellikler */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Lojistik Özellikler
              </h3>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="has_refrigerated_vehicle"
                    checked={formData.has_refrigerated_vehicle}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      🚛 Frigorifik Araç
                    </span>
                    <p className="text-xs text-slate-500">
                      Soğuk zincir teslimatı yapabiliyoruz
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="serves_outside_city"
                    checked={formData.serves_outside_city}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      🗺️ Şehir Dışı Teslimat
                    </span>
                    <p className="text-xs text-slate-500">
                      Şehir dışına da hizmet veriyoruz
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="available_24_7"
                    checked={formData.available_24_7}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      🕐 7/24 Hizmet
                    </span>
                    <p className="text-xs text-slate-500">
                      Gece ve hafta sonu dahil her zaman ulaşılabilir
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Etiketler */}
        {activeTab === "tags" && (
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm text-slate-600">
              Firmanızın özelliklerini ve sertifikalarını seçin.
            </p>

            {tagGroups.map((group) => {
              const groupTags = tags.filter((t) => t.group_id === group.id);
              if (groupTags.length === 0) return null;

              return (
                <div key={group.id} className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-violet-100 text-sm">
                      {group.icon || "🏷️"}
                    </span>
                    {group.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {groupTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selectedTags.includes(tag.id)
                            ? "bg-violet-100 text-violet-700 ring-2 ring-violet-500"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tag.icon && <span>{tag.icon}</span>}
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {selectedTags.length > 0 && (
              <div className="mt-4 rounded-lg bg-violet-50 px-4 py-2 text-sm text-violet-700">
                <strong>{selectedTags.length}</strong> etiket seçildi
              </div>
            )}
          </div>
        )}

        {/* Hizmet Bölgeleri */}
        {activeTab === "service_areas" && (
          <div className="space-y-6">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Hizmet Verdiğiniz Bölgeler
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    İl başlığına tıklayarak ilçeleri görün, hizmet verdiğiniz
                    ilçeleri işaretleyin.
                  </p>
                </div>
                {selectedDistrictIds.size > 0 && (
                  <div className="bg-leaf-50 border border-leaf-200 px-3 py-1.5 text-sm font-medium text-leaf-700">
                    {selectedDistrictIds.size} ilçe seçili
                  </div>
                )}
              </div>

              {loadingServiceAreas ? (
                <div className="py-8 text-center text-slate-500">
                  Yükleniyor...
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto border border-slate-200">
                  {cities.map((city) => {
                    const isExpanded = expandedCities.includes(city.id);
                    const cityDistricts = cityDistrictsMap[city.id] || [];
                    const isLoading = loadingCityDistricts[city.id];
                    const selectedCount = getSelectedCountInCity(city.id);
                    const allSelected =
                      cityDistricts.length > 0 &&
                      selectedCount === cityDistricts.length;

                    return (
                      <div
                        key={city.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        {/* Şehir Başlığı */}
                        <button
                          type="button"
                          onClick={() => toggleCityExpanded(city.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className={`h-4 w-4 text-slate-400 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
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
                            <span className="font-medium text-slate-900">
                              {city.name}
                            </span>
                          </div>
                          {selectedCount > 0 && (
                            <span className="bg-leaf-100 text-leaf-700 px-2 py-0.5 text-xs font-medium">
                              {selectedCount} ilçe
                            </span>
                          )}
                        </button>

                        {/* İlçeler */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                            {isLoading ? (
                              <div className="py-4 text-center text-sm text-slate-500">
                                İlçeler yükleniyor...
                              </div>
                            ) : cityDistricts.length === 0 ? (
                              <div className="py-4 text-center text-sm text-slate-500">
                                Bu ilde ilçe bulunamadı
                              </div>
                            ) : (
                              <>
                                {/* Tümünü Seç / Kaldır */}
                                <div className="mb-3 flex items-center gap-3 border-b border-slate-200 pb-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleAllDistrictsInCity(city.id, true)
                                    }
                                    className="text-xs font-medium text-leaf-600 hover:text-leaf-700"
                                  >
                                    Tümünü Seç
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleAllDistrictsInCity(city.id, false)
                                    }
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                  >
                                    Tümünü Kaldır
                                  </button>
                                  {allSelected && (
                                    <span className="ml-auto text-xs text-leaf-600">
                                      ✓ Tüm ilçeler seçili
                                    </span>
                                  )}
                                </div>

                                {/* İlçe Checkbox Grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                                  {cityDistricts.map((district) => (
                                    <label
                                      key={district.id}
                                      className="flex cursor-pointer items-center gap-2 py-1"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedDistrictIds.has(
                                          district.id
                                        )}
                                        onChange={() =>
                                          toggleDistrictSelection(district.id)
                                        }
                                        className="h-4 w-4 border-slate-300 text-leaf-600 focus:ring-leaf-500"
                                      />
                                      <span className="text-sm text-slate-700">
                                        {district.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              <strong>💡 İpucu:</strong> Şehir adına tıklayarak ilçeleri
              görüntüleyin. &quot;Tümünü Seç&quot; ile o şehirdeki tüm ilçeleri
              hızlıca işaretleyebilirsiniz. Değişiklikler sayfanın altındaki
              &quot;Kaydet&quot; butonu ile kaydedilir.
            </div>
          </div>
        )}

        {/* Operasyonel Ayarlar */}
        {activeTab === "operational" && (
          <div className="space-y-6">
            {/* Sipariş Süresi */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Sipariş Süreleri
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Minimum Sipariş Süresi
                  </label>
                  <select
                    name="lead_time_type"
                    value={formData.lead_time_type}
                    onChange={handleChange}
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  >
                    <option value="urgent">Acil (24 saat içinde)</option>
                    <option value="standard">Standart (2-3 gün)</option>
                    <option value="advance">Önceden (1 hafta+)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Minimum Saat (opsiyonel)
                  </label>
                  <input
                    type="number"
                    name="lead_time_hours"
                    value={formData.lead_time_hours}
                    onChange={handleChange}
                    placeholder="örn: 48"
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="accepts_last_minute"
                      checked={formData.accepts_last_minute}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        ⚡ Son Dakika Siparişleri
                      </span>
                      <p className="text-xs text-slate-500">
                        Acil siparişleri değerlendirebiliriz
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Ek Ücretler */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Ek Ücretler</h3>
              <p className="mb-4 text-sm text-slate-600">
                Hafta sonu veya resmi tatillerde uygulanan ek ücret yüzdeleri
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Hafta Sonu Ek Ücreti (%)
                  </label>
                  <input
                    type="number"
                    name="weekend_surcharge_percent"
                    value={formData.weekend_surcharge_percent}
                    onChange={handleChange}
                    placeholder="örn: 15"
                    min="0"
                    max="100"
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Resmi Tatil Ek Ücreti (%)
                  </label>
                  <input
                    type="number"
                    name="holiday_surcharge_percent"
                    value={formData.holiday_surcharge_percent}
                    onChange={handleChange}
                    placeholder="örn: 25"
                    min="0"
                    max="100"
                    className="w-full border border-slate-200 border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medya */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
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
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
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
            className="inline-flex items-center gap-2 border border-slate-200 bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-leaf-700 hover:shadow-md disabled:opacity-50"
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
