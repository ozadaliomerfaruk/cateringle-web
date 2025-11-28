//src/app/components/LeadForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface LeadFormProps {
  vendorId: string;
  vendorName: string;
}

export default function LeadForm({ vendorId, vendorName }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
  } | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
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
    notes: "",
  });

  // Giriş yapmış kullanıcı varsa bilgilerini çek
  useEffect(() => {
    async function fetchUser() {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Profil bilgilerini çek
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

        // Formu otomatik doldur
        setForm((prev) => ({
          ...prev,
          customerName: profile?.full_name || "",
          customerEmail: user.email || "",
          customerPhone: profile?.phone || "",
        }));
      }
    }

    fetchUser();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim() || null,
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
          notes: form.notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Bir hata oluştu");
        return;
      }

      setSuccess(true);
      setForm({
        customerName: currentUser?.fullName || "",
        customerEmail: currentUser?.email || "",
        customerPhone: currentUser?.phone || "",
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
        notes: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMsg("Beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        Ücretsiz Teklif Alın
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        {vendorName} size özel bir teklif hazırlasın
      </p>

      {/* Giriş yapmış kullanıcı bilgisi */}
      {currentUser && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <span className="font-medium">
            {currentUser.fullName || currentUser.email}
          </span>{" "}
          olarak devam ediyorsunuz
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p className="font-medium">Talebiniz iletildi!</p>
          <p className="mt-1 text-emerald-600">
            Firma en kısa sürede sizinle iletişime geçecek.
          </p>
          {currentUser && (
            <p className="mt-2">
              <a
                href="/account"
                className="font-medium underline hover:text-emerald-800"
              >
                Hesabınızdan
              </a>{" "}
              tüm taleplerinizi takip edebilirsiniz.
            </p>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* İletişim Bilgileri */}
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Adınız Soyadınız
            </label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="Adınızı girin"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.customerName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              E-posta
            </label>
            <input
              type="email"
              name="customerEmail"
              required
              placeholder="ornek@email.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.customerEmail}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Telefon <span className="text-slate-400">(isteğe bağlı)</span>
            </label>
            <input
              type="tel"
              name="customerPhone"
              placeholder="05XX XXX XX XX"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.customerPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Etkinlik Bilgileri */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Etkinlik Tarihi
            </label>
            <input
              type="date"
              name="eventDate"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.eventDate}
              onChange={handleChange}
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
              placeholder="Örn: 50"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.guestCount}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Bütçe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Min. Bütçe
            </label>
            <input
              type="number"
              name="budgetMin"
              min="0"
              placeholder="TL"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.budgetMin}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Maks. Bütçe
            </label>
            <input
              type="number"
              name="budgetMax"
              min="0"
              placeholder="TL"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={form.budgetMax}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Servis Tarzı */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Servis Tarzı
          </label>
          <select
            name="serviceStyle"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={form.serviceStyle}
            onChange={handleChange}
          >
            <option value="">Henüz karar vermedim</option>
            <option value="open_buffet">Açık Büfe</option>
            <option value="cocktail">Kokteyl</option>
            <option value="plated">Oturmalı Menü</option>
            <option value="coffee_break">Coffee Break</option>
            <option value="lunchbox">Lunchbox / Paket</option>
          </select>
        </div>

        {/* Ek Hizmetler */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-700">
            Ek hizmetlere ihtiyacınız var mı?
          </p>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsServiceStaff"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={form.needsServiceStaff}
              onChange={handleChange}
            />
            Garson / Servis ekibi
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsCleanup"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={form.needsCleanup}
              onChange={handleChange}
            />
            Hizmet sonrası temizlik
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="needsTablesChairs"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={form.wantsRealTableware}
              onChange={handleChange}
            />
            Porselen tabak ve cam bardak
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="wantsDisposableTableware"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={form.wantsDisposableTableware}
              onChange={handleChange}
            />
            Kullan-at tabak ve bardak
          </label>
        </div>

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
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow disabled:opacity-60"
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
