"use client";

import { useState } from "react";

interface QuoteFormProps {
  vendorLeadId: string;
  guestCount: number | null;
  sendQuoteAction: (formData: FormData) => Promise<void>;
}

export default function QuoteForm({
  vendorLeadId,
  guestCount,
  sendQuoteAction,
}: QuoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [message, setMessage] = useState("");
  const [validDays, setValidDays] = useState("7");

  // Kişi başı fiyat değişince toplam hesapla
  const handlePricePerPersonChange = (value: string) => {
    setPricePerPerson(value);
    if (value && guestCount) {
      const calculated = parseFloat(value) * guestCount;
      setTotalPrice(calculated.toString());
    }
  };

  // Toplam fiyat değişince kişi başı hesapla
  const handleTotalPriceChange = (value: string) => {
    setTotalPrice(value);
    if (value && guestCount) {
      const calculated = parseFloat(value) / guestCount;
      setPricePerPerson(calculated.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("vendor_lead_id", vendorLeadId);
    formData.append("total_price", totalPrice);
    if (pricePerPerson) {
      formData.append("price_per_person", pricePerPerson);
    }
    formData.append("message", message);

    // Geçerlilik tarihi hesapla
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validDays));
    formData.append("valid_until", validUntil.toISOString().split("T")[0]);

    await sendQuoteAction(formData);
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-900">Teklif Gönder</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fiyatlandırma */}
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Kişi Başı Fiyat (₺)
              </label>
              <input
                type="number"
                value={pricePerPerson}
                onChange={(e) => handlePricePerPersonChange(e.target.value)}
                placeholder="150"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf--500 focus:outline-none focus:ring-1 focus:ring-leaf--500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Toplam Fiyat (₺) *
              </label>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
                placeholder="15000"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf--500 focus:outline-none focus:ring-1 focus:ring-leaf--500"
              />
            </div>
          </div>
          {guestCount && pricePerPerson && (
            <p className="mt-2 text-xs text-slate-500">
              {guestCount} kişi ×{" "}
              {parseFloat(pricePerPerson).toLocaleString("tr-TR")} ₺ ={" "}
              {parseFloat(totalPrice).toLocaleString("tr-TR")} ₺
            </p>
          )}
        </div>

        {/* Mesaj */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Mesajınız
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Teklifiniz hakkında ek bilgi, menü detayları, özel notlar..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf--500 focus:outline-none focus:ring-1 focus:ring-leaf--500"
          />
        </div>

        {/* Geçerlilik Süresi */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Teklif Geçerlilik Süresi
          </label>
          <select
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf--500 focus:outline-none focus:ring-1 focus:ring-leaf--500"
          >
            <option value="3">3 gün</option>
            <option value="7">7 gün</option>
            <option value="14">14 gün</option>
            <option value="30">30 gün</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !totalPrice}
          className="w-full rounded-lg bg-leaf-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-leaf-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
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
              Gönderiliyor...
            </span>
          ) : (
            "Teklifi Gönder"
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Teklif gönderildiğinde müşteriye e-posta ile bildirilecektir.
      </p>
    </div>
  );
}
