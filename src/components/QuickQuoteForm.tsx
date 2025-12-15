"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Turnstile } from "@/components/Turnstile";
import {
  CalendarBlank,
  Users,
  Tag,
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";

interface Segment {
  id: number;
  name: string;
  slug: string;
}

interface QuickQuoteFormProps {
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function QuickQuoteForm({
  vendorId,
  vendorName,
  onSuccess,
  onClose,
  className = "",
}: QuickQuoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
  } | null>(null);

  // Turnstile
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  // Form state - minimal alanlar
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    segmentId: "",
    eventDate: "",
    guestCount: "",
    notes: "",
  });

  const supabase = createBrowserSupabaseClient();

  // Kullanıcı ve segment verilerini çek
  useEffect(() => {
    const fetchData = async () => {
      // Segments
      const { data: segmentsData } = await supabase
        .from("customer_segments")
        .select("id, name, slug")
        .order("sort_order");

      if (segmentsData) setSegments(segmentsData);

      // Current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();

        setCurrentUser({
          id: user.id,
          email: user.email || "",
          fullName: profile?.full_name || "",
          phone: profile?.phone || "",
        });

        // Form'u doldur
        setForm((prev) => ({
          ...prev,
          customerName: profile?.full_name || "",
          customerEmail: user.email || "",
          customerPhone: profile?.phone || "",
        }));
      }
    };

    fetchData();
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Validation
    if (!form.customerName.trim()) {
      setErrorMsg("İsim gerekli");
      setLoading(false);
      return;
    }

    if (!form.customerEmail.trim()) {
      setErrorMsg("E-posta gerekli");
      setLoading(false);
      return;
    }

    if (!form.eventDate) {
      setErrorMsg("Etkinlik tarihi gerekli");
      setLoading(false);
      return;
    }

    if (!form.guestCount) {
      setErrorMsg("Kişi sayısı gerekli");
      setLoading(false);
      return;
    }

    if (!turnstileToken) {
      setErrorMsg("Lütfen güvenlik doğrulamasını tamamlayın");
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
          eventDate: form.eventDate,
          guestCount: form.guestCount,
          notes: form.notes.trim() || null,
          turnstileToken,
          idempotencyKey: crypto.randomUUID(),
          // QuickQuote flag
          isQuickQuote: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const messages = data.details
            .map((d: { message: string }) => d.message)
            .join(", ");
          throw new Error(messages);
        }
        throw new Error(data.error || "Bir hata oluştu");
      }

      setSuccess(true);
      setTurnstileToken("");
      onSuccess?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Bir hata oluştu");
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle size={32} weight="fill" className="text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Talebiniz İletildi!
        </h3>
        <p className="mt-2 text-slate-600">
          {vendorName} en kısa sürede sizinle iletişime geçecek.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-leaf-600 hover:text-leaf-700 font-medium"
          >
            Kapat
          </button>
        )}
      </div>
    );
  }

  // Minimum tarih (bugün)
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Hata mesajı */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle size={18} weight="fill" />
          {errorMsg}
        </div>
      )}

      {/* İsim - Email yan yana */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            İsim <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Adınız Soyadınız"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="customerEmail"
            value={form.customerEmail}
            onChange={handleChange}
            placeholder="ornek@email.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            required
          />
        </div>
      </div>

      {/* Telefon (opsiyonel) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Telefon <span className="text-slate-400">(opsiyonel)</span>
        </label>
        <input
          type="tel"
          name="customerPhone"
          value={form.customerPhone}
          onChange={handleChange}
          placeholder="05XX XXX XX XX"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
        />
      </div>

      {/* Etkinlik Türü */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Tag size={16} weight="bold" />
          Etkinlik Türü
        </label>
        <select
          name="segmentId"
          value={form.segmentId}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
        >
          <option value="">Seçiniz (opsiyonel)</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tarih ve Kişi Sayısı */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <CalendarBlank size={16} weight="bold" />
            Etkinlik Tarihi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            min={today}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Users size={16} weight="bold" />
            Kişi Sayısı <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="guestCount"
            value={form.guestCount}
            onChange={handleChange}
            placeholder="Örn: 50"
            min="1"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            required
          />
        </div>
      </div>

      {/* Not (opsiyonel) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Notunuz <span className="text-slate-400">(opsiyonel)</span>
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Varsa eklemek istediğiniz detaylar..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500 resize-none"
        />
      </div>

      {/* Turnstile */}
      <div className="flex justify-center">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken("")}
          onExpire={() => setTurnstileToken("")}
          theme="auto"
          size="normal"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !turnstileToken}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-leaf-600 px-4 py-3 font-medium text-white transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin\"
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
            Gönderiliyor...
          </>
        ) : (
          <>
            <PaperPlaneTilt size={20} weight="bold" />
            Hızlı Teklif Al
          </>
        )}
      </button>

      {/* Alt bilgi */}
      <p className="text-center text-xs text-slate-500">
        Bilgileriniz sadece {vendorName} ile paylaşılacaktır.
      </p>
    </form>
  );
}
