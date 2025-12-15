// src/components/QuoteCard.tsx
"use client";

import { useState } from "react";
import {
  CurrencyCircleDollar,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  SpinnerGap,
} from "@phosphor-icons/react";
import type { EmbeddedQuote, QuoteStatus } from "@/types/messaging";

interface QuoteCardProps {
  quote: EmbeddedQuote;
  userRole: "vendor" | "customer";
  isOwnMessage: boolean;
  onAccept?: (quoteId: string) => Promise<void>;
  onReject?: (quoteId: string) => Promise<void>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const statusConfig: Record<
  QuoteStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Taslak",
    color: "bg-slate-100 text-slate-600",
    icon: <Clock size={14} weight="bold" />,
  },
  sent: {
    label: "Gönderildi",
    color: "bg-blue-100 text-blue-700",
    icon: <Clock size={14} weight="bold" />,
  },
  viewed: {
    label: "Görüldü",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={14} weight="bold" />,
  },
  accepted: {
    label: "Kabul Edildi",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} weight="bold" />,
  },
  rejected: {
    label: "Reddedildi",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} weight="bold" />,
  },
  expired: {
    label: "Süresi Doldu",
    color: "bg-slate-100 text-slate-500",
    icon: <Clock size={14} weight="bold" />,
  },
};

export default function QuoteCard({
  quote,
  userRole,
  isOwnMessage,
  onAccept,
  onReject,
}: QuoteCardProps) {
  const [isLoading, setIsLoading] = useState<"accept" | "reject" | null>(null);
  const status = statusConfig[quote.status];

  // Customer can accept/reject if quote is sent or viewed
  const canRespond =
    userRole === "customer" &&
    !isOwnMessage &&
    ["sent", "viewed"].includes(quote.status);

  // Check if quote is expired
  const isExpired =
    quote.valid_until && new Date(quote.valid_until) < new Date();

  const handleAccept = async () => {
    if (!onAccept || isLoading) return;
    setIsLoading("accept");
    try {
      await onAccept(quote.id);
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async () => {
    if (!onReject || isLoading) return;
    setIsLoading("reject");
    try {
      await onReject(quote.id);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isOwnMessage
          ? "border-leaf-200 bg-leaf-50"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isOwnMessage ? "bg-leaf-100" : "bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <CurrencyCircleDollar
            size={20}
            weight="fill"
            className={isOwnMessage ? "text-leaf-600" : "text-slate-500"}
          />
          <span className="text-sm font-medium text-slate-700">Teklif</span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-slate-900">
            {formatPrice(quote.total_price)}
          </p>
          {quote.price_per_person && (
            <p className="text-sm text-slate-500">
              Kişi başı: {formatPrice(quote.price_per_person)}
            </p>
          )}
        </div>

        {/* Message */}
        {quote.message && (
          <p className="mb-3 text-sm text-slate-600 whitespace-pre-wrap">
            {quote.message}
          </p>
        )}

        {/* Valid until */}
        {quote.valid_until && (
          <p
            className={`text-xs ${isExpired ? "text-red-500" : "text-slate-400"}`}
          >
            {isExpired ? "⚠️ Süre doldu: " : "Geçerlilik: "}
            {formatDate(quote.valid_until)}
          </p>
        )}
      </div>

      {/* Actions - Only for customer */}
      {canRespond && !isExpired && (
        <div className="flex border-t border-slate-100">
          <button
            onClick={handleReject}
            disabled={isLoading !== null}
            className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {isLoading === "reject" ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : (
              <X size={18} weight="bold" />
            )}
            Reddet
          </button>
          <div className="w-px bg-slate-100" />
          <button
            onClick={handleAccept}
            disabled={isLoading !== null}
            className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
          >
            {isLoading === "accept" ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : (
              <Check size={18} weight="bold" />
            )}
            Kabul Et
          </button>
        </div>
      )}

      {/* Expired warning for customer */}
      {canRespond && isExpired && (
        <div className="border-t border-slate-100 bg-red-50 px-4 py-2 text-center text-xs text-red-600">
          Bu teklifin süresi dolmuş. Firma ile iletişime geçin.
        </div>
      )}
    </div>
  );
}
