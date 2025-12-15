//src/components/LeadForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Turnstile } from "@/components/Turnstile";

interface Segment {
  id: number;
  name: string;
  slug: string;
}

interface CuisineType {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface DeliveryModel {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface DietaryTag {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

// Vendor özellikleri
interface VendorFeatures {
  has_refrigerated_vehicle?: boolean | null;
  serves_outside_city?: boolean | null;
  available_24_7?: boolean | null;
  halal_certified?: boolean | null;
  free_tasting?: boolean | null;
  free_delivery?: boolean | null;
  accepts_last_minute?: boolean | null;
}

interface LeadFormProps {
  vendorId: string;
  vendorName: string;
  vendorFeatures?: VendorFeatures;
}

export default function LeadForm({
  vendorId,
  vendorName,
  vendorFeatures,
}: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [deliveryModels, setDeliveryModels] = useState<DeliveryModel[]>([]);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
  } | null>(null);

  // Turnstile token state
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileError, setTurnstileError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    segmentId: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budgetMin: "",
    budgetMax: "",
    serviceStyle: "",
    needsServiceStaff: false,
    needsCleanup: false,
    needsTablesChairs: false,
    wantsRealTableware: false,
    wantsDisposableTableware: false,
    // Yeni alanlar
    cuisinePreference: "",
    deliveryModel: "",
    dietaryRequirements: [] as string[],
    notes: "",
    // Vendor özelliklerine göre dinamik alanlar
    wantsRefrigerated: false,
    wantsOutsideCity: false,
    wants24_7: false,
    wantsHalal: false,
    wantsTasting: false,
    wantsFreeDelivery: false,
    wantsLastMinute: false,
  });

  // Segmentleri ve kullanıcı bilgilerini çek
  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserSupabaseClient();

      // Segmentleri çek
      const { data: segmentData } = await supabase
        .from("customer_segments")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order");

      if (segmentData) {
        setSegments(segmentData);
      }

      // Mutfak türlerini çek
      const { data: cuisineData } = await supabase
        .from("cuisine_types")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .order("sort_order");

      if (cuisineData) {
        setCuisineTypes(cuisineData);
      }

      // Teslimat modellerini çek
      const { data: deliveryData } = await supabase
        .from("delivery_models")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .order("sort_order");

      if (deliveryData) {
        setDeliveryModels(deliveryData);
      }

      // Diyet etiketlerini çek (Diyet/Menü grubundan)
      const { data: tagData } = await supabase
        .from("tags")
        .select("id, name, slug, icon, group:tag_groups!inner(slug)")
        .eq("is_active", true)
        .eq("tag_groups.slug", "diyet-menu")
        .order("sort_order");

      if (tagData) {
        setDietaryTags(
          tagData.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            icon: t.icon,
          }))
        );
      }

      // Kullanıcı bilgilerini çek
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        setCurrentUser({
          id: user.id,
          email: user.email || "",
          fullName: profile?.full_name || "",
          phone: profile?.phone || "",
        });

        setForm((prev) => ({
          ...prev,
          customerName: profile?.full_name || "",
          customerEmail: user.email || "",
          customerPhone: profile?.phone || "",
        }));
      }
    }

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Diyet gereksinimleri toggle
  const handleDietaryToggle = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(slug)
        ? prev.dietaryRequirements.filter((s) => s !== slug)
        : [...prev.dietaryRequirements, slug],
    }));
  };

  // Segment değiştiğinde etkinlik türünü sıfırla
  const handleSegmentChange = (segmentId: string) => {
    setForm((prev) => ({
      ...prev,
      segmentId,
      eventType: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);
    setLoading(true);

    // Turnstile token kontrolü
    if (!turnstileToken) {
      setErrorMsg("Lütfen güvenlik doğrulamasını tamamlayın.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim() || null,
          segmentId: form.segmentId ? parseInt(form.segmentId, 10) : null,
          eventType: form.eventType || null,
          eventDate: form.eventDate || null,
          guestCount: form.guestCount || null,
          budgetMin: form.budgetMin || null,
          budgetMax: form.budgetMax || null,
          serviceStyle: form.serviceStyle || null,
          needsServiceStaff: form.needsServiceStaff,
          needsCleanup: form.needsCleanup,
          needsTablesChairs: form.needsTablesChairs,
          wantsRealTableware: form.wantsRealTableware,
          wantsDisposableTableware: form.wantsDisposableTableware,
          cuisinePreference: form.cuisinePreference || null,
          deliveryModel: form.deliveryModel || null,
          dietaryRequirements:
            form.dietaryRequirements.length > 0
              ? form.dietaryRequirements
              : null,
          notes: form.notes.trim() || null,
          // Turnstile token
          turnstileToken,
          // Çift submit koruması için idempotency key
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Validation hatası varsa detayları göster
        if (data.details && Array.isArray(data.details)) {
          const messages = data.details
            .map((d: { message: string }) => d.message)
            .join(", ");
          throw new Error(messages);
        }
        throw new Error(data.error || "Bir hata oluştu");
      }

      setSuccess(true);
      // Turnstile'ı sıfırla (yeni token gerekecek)
      setTurnstileToken("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Bir hata oluştu");
      // Hata durumunda Turnstile'ı sıfırla
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  // Kurumsal etkinlik türleri
  const corporateEventTypes = [
    { value: "ofis-ogle", label: "Ofis Öğle Yemeği" },
    { value: "toplanti", label: "Toplantı İkramı" },
    { value: "kahvalti", label: "Ofis Kahvaltısı" },
    { value: "etkinlik", label: "Kurumsal Etkinlik" },
    { value: "konferans", label: "Konferans / Seminer" },
    { value: "fuar", label: "Fuar / Organizasyon" },
  ];

  // Bireysel etkinlik türleri
  const individualEventTypes = [
    { value: "dugun", label: "Düğün / Nişan" },
    { value: "dogum-gunu", label: "Doğum Günü" },
    { value: "ev-partisi", label: "Ev Partisi" },
    { value: "baby-shower", label: "Baby Shower / Mevlüt" },
    { value: "mezuniyet", label: "Mezuniyet" },
    { value: "yildonumu", label: "Yıldönümü / Özel Gün" },
    { value: "piknik", label: "Piknik / Açık Hava" },
  ];

  // Seçili segmente göre etkinlik türlerini belirle
  const selectedSegment = segments.find(
    (s) => s.id === parseInt(form.segmentId)
  );
  const eventTypes =
    selectedSegment?.slug === "kurumsal"
      ? corporateEventTypes
      : selectedSegment?.slug === "bireysel"
      ? individualEventTypes
      : [];

  // Başarı mesajı
  if (success) {
    return (
      <div className="space-y-4 rounded-2xl border border-leaf-200 bg-leaf-50 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100">
          <svg
            className="h-8 w-8 text-leaf-600"
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
        </div>
        <div>
          <h3 className="text-lg font-semibold text-leaf-800">
            Talebiniz Gönderildi
          </h3>
          <p className="mt-1 text-sm text-leaf-600">
            <span className="font-medium">{vendorName}</span> en kısa sürede
            sizinle iletişime geçecek.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setForm({
              customerName: currentUser?.fullName || "",
              customerEmail: currentUser?.email || "",
              customerPhone: currentUser?.phone || "",
              segmentId: "",
              eventType: "",
              eventDate: "",
              guestCount: "",
              budgetMin: "",
              budgetMax: "",
              serviceStyle: "",
              needsServiceStaff: false,
              needsCleanup: false,
              needsTablesChairs: false,
              wantsRealTableware: false,
              wantsDisposableTableware: false,
              cuisinePreference: "",
              deliveryModel: "",
              dietaryRequirements: [],
              notes: "",
              wantsRefrigerated: false,
              wantsOutsideCity: false,
              wants24_7: false,
              wantsHalal: false,
              wantsTasting: false,
              wantsFreeDelivery: false,
              wantsLastMinute: false,
            });
          }}
          className="text-sm font-medium text-leaf-700 underline hover:text-leaf-800"
        >
          Yeni talep oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Ücretsiz Teklif Al
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {vendorName} ile iletişime geçin
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İsim */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Adınız Soyadınız <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            required
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
            value={form.customerName}
            onChange={handleChange}
          />
        </div>

        {/* E-posta */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="customerEmail"
            required
            placeholder="ornek@email.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
            value={form.customerEmail}
            onChange={handleChange}
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Telefon <span className="text-slate-400">(isteğe bağlı)</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            placeholder="05XX XXX XX XX"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
            value={form.customerPhone}
            onChange={handleChange}
          />
        </div>

        {/* Segment Seçimi */}
        {segments.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Müşteri Tipi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => handleSegmentChange(segment.id.toString())}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    form.segmentId === segment.id.toString()
                      ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {segment.slug === "kurumsal" ? "🏢" : "🎉"} {segment.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Etkinlik Türü - Segment seçildiyse göster */}
        {form.segmentId && eventTypes.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Etkinlik Türü
            </label>
            <select
              name="eventType"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.eventType}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              {eventTypes.map((et) => (
                <option key={et.value} value={et.value}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tarih ve Kişi Sayısı */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Etkinlik Tarihi
            </label>
            <input
              type="date"
              name="eventDate"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.eventDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Kişi Sayısı
            </label>
            <input
              type="number"
              name="guestCount"
              min="1"
              max="10000"
              placeholder="Örn: 50"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.guestCount}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Bütçe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Min. Bütçe (₺)
            </label>
            <input
              type="number"
              name="budgetMin"
              min="0"
              placeholder="Örn: 5000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.budgetMin}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Max. Bütçe (₺)
            </label>
            <input
              type="number"
              name="budgetMax"
              min="0"
              placeholder="Örn: 15000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.budgetMax}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Servis Stili */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Servis Tercihi
          </label>
          <select
            name="serviceStyle"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
            value={form.serviceStyle}
            onChange={handleChange}
          >
            <option value="">Seçiniz</option>
            <option value="buffet">Açık Büfe</option>
            <option value="seated">Oturmalı Servis</option>
            <option value="cocktail">Kokteyl</option>
            <option value="boxed">Paket / Kutu</option>
            <option value="drop_off">Sadece Teslimat</option>
          </select>
        </div>

        {/* Mutfak Tercihi */}
        {cuisineTypes.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Mutfak Tercihi
            </label>
            <select
              name="cuisinePreference"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.cuisinePreference}
              onChange={handleChange}
            >
              <option value="">Fark etmez</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine.id} value={cuisine.slug}>
                  {cuisine.icon} {cuisine.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Teslimat Modeli */}
        {deliveryModels.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Teslimat Tercihi
            </label>
            <select
              name="deliveryModel"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
              value={form.deliveryModel}
              onChange={handleChange}
            >
              <option value="">Fark etmez</option>
              {deliveryModels.map((model) => (
                <option key={model.id} value={model.slug}>
                  {model.icon} {model.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Diyet Gereksinimleri */}
        {dietaryTags.length > 0 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-700">
              Diyet gereksinimleri{" "}
              <span className="text-slate-400">(varsa seçin)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {dietaryTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleDietaryToggle(tag.slug)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    form.dietaryRequirements.includes(tag.slug)
                      ? "bg-leaf-100 text-leaf-700 ring-2 ring-leaf-500"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ek Hizmetler */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-700">
            Ek hizmetlere ihtiyacınız var mı?
          </p>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsServiceStaff"
              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
              checked={form.needsServiceStaff}
              onChange={handleChange}
            />
            Garson / Servis ekibi
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsCleanup"
              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
              checked={form.needsCleanup}
              onChange={handleChange}
            />
            Hizmet sonrası temizlik
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsTablesChairs"
              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
              checked={form.needsTablesChairs}
              onChange={handleChange}
            />
            Masa ve sandalye
          </label>
        </div>

        {/* Tabak/Çatal Tercihi */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-700">Tabak tercihiniz</p>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="wantsRealTableware"
              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
              checked={form.wantsRealTableware}
              onChange={handleChange}
            />
            Porselen tabak ve cam bardak
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="wantsDisposableTableware"
              className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
              checked={form.wantsDisposableTableware}
              onChange={handleChange}
            />
            Kullan-at tabak ve bardak
          </label>
        </div>

        {/* Firma Özellikleri - Dinamik */}
        {vendorFeatures &&
          (vendorFeatures.has_refrigerated_vehicle ||
            vendorFeatures.serves_outside_city ||
            vendorFeatures.available_24_7 ||
            vendorFeatures.halal_certified ||
            vendorFeatures.free_tasting ||
            vendorFeatures.free_delivery ||
            vendorFeatures.accepts_last_minute) && (
            <div className="space-y-2 rounded-lg border border-leaf-200 bg-leaf-50 p-4">
              <p className="text-xs font-medium text-leaf-800">
                Bu firmanın sunduğu özellikler
              </p>
              {vendorFeatures?.has_refrigerated_vehicle && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsRefrigerated"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsRefrigerated}
                    onChange={handleChange}
                  />
                  Frigorifik araçla teslimat istiyorum
                </label>
              )}
              {vendorFeatures?.serves_outside_city && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsOutsideCity"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsOutsideCity}
                    onChange={handleChange}
                  />
                  Şehir dışına teslimat istiyorum
                </label>
              )}
              {vendorFeatures?.available_24_7 && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wants24_7"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wants24_7}
                    onChange={handleChange}
                  />
                  Gece/erken saatlerde hizmet istiyorum
                </label>
              )}
              {vendorFeatures?.halal_certified && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsHalal"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsHalal}
                    onChange={handleChange}
                  />
                  Helal sertifikalı yemek istiyorum
                </label>
              )}
              {vendorFeatures?.free_tasting && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsTasting"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsTasting}
                    onChange={handleChange}
                  />
                  Önceden tadım yapmak istiyorum
                </label>
              )}
              {vendorFeatures?.free_delivery && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsFreeDelivery"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsFreeDelivery}
                    onChange={handleChange}
                  />
                  Ücretsiz teslimat istiyorum
                </label>
              )}
              {vendorFeatures?.accepts_last_minute && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="wantsLastMinute"
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf-500"
                    checked={form.wantsLastMinute}
                    onChange={handleChange}
                  />
                  Acil/son dakika siparişi
                </label>
              )}
            </div>
          )}

        {/* Notlar */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Eklemek istediğiniz notlar{" "}
            <span className="text-slate-400">(isteğe bağlı)</span>
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Özel istekleriniz, diyet gereksinimleri, alerjiler..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        {/* Turnstile Widget */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setTurnstileError(null);
            }}
            onError={(error) => {
              setTurnstileError(
                "Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyin."
              );
              console.error("Turnstile error:", error);
            }}
            onExpire={() => {
              setTurnstileToken("");
              setTurnstileError(
                "Güvenlik doğrulaması süresi doldu. Lütfen tekrar deneyin."
              );
            }}
            theme="light"
          />
        </div>

        {turnstileError && (
          <p className="text-center text-xs text-red-500">{turnstileError}</p>
        )}

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="w-full rounded-xl bg-leaf-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-leaf-700 hover:shadow disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Ücretsiz Teklif İste"}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          Bilgileriniz yalnızca bu firma ile paylaşılır
        </p>
      </form>
    </div>
  );
}
