// src/components/QuoteSendForm.tsx
"use client";

import { useState } from "react";
import { CurrencyCircleDollar, X, PaperPlaneRight, SpinnerGap } from "@phosphor-icons/react";
import { z } from "zod";

const quoteSchema = z.object({
  totalPrice: z.number().min(1, "Fiyat girilmeli"),
  pricePerPerson: z.number().optional(),
  message: z.string().max(1000, "Mesaj çok uzun").optional(),
  validDays: z.number().min(1).max(90).optional(),
});

interface QuoteSendFormProps {
  vendorLeadId: string;
  guestCount?: number;
  onSend: (data: {
    totalPrice: number;
    pricePerPerson?: number;
    message?: string;
    validUntil?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function QuoteSendForm({
  vendorLeadId,
  guestCount,
  onSend,
  onCancel,
}: QuoteSendFormProps) {
  const [totalPrice, setTotalPrice] = useState<string>("");
  const [pricePerPerson, setPricePerPerson] = useState<string>("");
  const [message, setMessage] = useState("");
  const [validDays, setValidDays] = useState<string>("7");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate price per person
  const handleTotalPriceChange = (value: string) => {
    setTotalPrice(value);
    if (guestCount && guestCount > 0 && value) {
      const total = parseFloat(value);
      if (!isNaN(total)) {
        setPricePerPerson(Math.round(total / guestCount).toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = {
      totalPrice: parseFloat(totalPrice),
      pricePerPerson: pricePerPerson ? parseFloat(pricePerPerson) : undefined,
      message: message.trim() || undefined,
      validDays: validDays ? parseInt(validDays) : undefined,
    };

    const validation = quoteSchema.safeParse(data);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    // Calculate valid_until date
    let validUntil: string | undefined;
    if (data.validDays) {
      const date = new Date();
      date.setDate(date.getDate() + data.validDays);
      validUntil = date.toISOString();
    }

    setIsLoading(true);
    try {
      await onSend({
        totalPrice: data.totalPrice,
        pricePerPerson: data.pricePerPerson,
        message: data.message,
        validUntil,
      });
    } catch (err) {
      setError("Teklif gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <CurrencyCircleDollar size={20} weight="fill" className="text-leaf-600" />
          <span className="font-medium text-slate-900">Teklif Gönder</span>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Price Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Toplam Fiyat *
            </label>
            <div className="relative">
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₺
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Kişi Başı {guestCount && `(${guestCount} kişi)`}
            </label>
            <div className="relative">
              <input
                type="number"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                placeholder="Otomatik"
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₺
              </span>
            </div>
          </div>
        </div>

        {/* Valid Days */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Geçerlilik Süresi
          </label>
          <select
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
          >
            <option value="3">3 gün</option>
            <option value="7">7 gün</option>
            <option value="14">14 gün</option>
            <option value="30">30 gün</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Teklif Notu (Opsiyonel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Menü detayları, özel koşullar..."
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
          />
          <p className="mt-1 text-xs text-slate-400">{message.length}/1000</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !totalPrice}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-leaf-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-leaf-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <SpinnerGap size={18} className="animate-spin" />
          ) : (
            <PaperPlaneRight size={18} weight="fill" />
          )}
          Teklifi Gönder
        </button>
      </form>
    </div>
  );
}
