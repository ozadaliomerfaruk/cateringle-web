import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tekliflerim | Hesabım",
  description: "Aldığınız teklifleri görüntüleyin",
};

interface Quote {
  id: string;
  total_price: number;
  price_per_person: number | null;
  message: string | null;
  status: string;
  valid_until: string | null;
  sent_at: string | null;
  created_at: string;
  vendor_lead: {
    id: string;
    vendor: {
      id: string;
      business_name: string;
      slug: string;
      logo_url: string | null;
    };
    lead: {
      event_date: string | null;
      guest_count: number | null;
      service_style: string | null;
    };
  };
}

export default async function QuotesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/quotes");
  }

  // Müşterinin tekliflerini çek
  const { data: quotes } = await supabase
    .from("quotes")
    .select(
      `
      id,
      total_price,
      price_per_person,
      message,
      status,
      valid_until,
      sent_at,
      created_at,
      vendor_lead:vendor_leads!inner (
        id,
        vendor:vendors (
          id,
          business_name,
          slug,
          logo_url
        ),
        lead:leads!inner (
          event_date,
          guest_count,
          service_style,
          customer_profile_id
        )
      )
    `
    )
    .eq("vendor_lead.lead.customer_profile_id", user.id)
    .in("status", ["sent", "viewed", "accepted", "rejected"])
    .order("created_at", { ascending: false });

  const quoteList = (quotes as unknown as Quote[]) || [];

  // Gruplama: Bekleyen, Kabul Edilen, Diğer
  const pendingQuotes = quoteList.filter((q) =>
    ["sent", "viewed"].includes(q.status)
  );
  const acceptedQuotes = quoteList.filter((q) => q.status === "accepted");
  const otherQuotes = quoteList.filter((q) => q.status === "rejected");

  const statusConfig: Record<string, { label: string; color: string }> = {
    sent: { label: "Yeni Teklif", color: "bg-blue-100 text-blue-700" },
    viewed: { label: "Görüntülendi", color: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Kabul Edildi", color: "bg-green-100 text-green-700" },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
  };

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
    self_service: "Self Servis",
  };

  const QuoteCard = ({ quote }: { quote: Quote }) => {
    const vendor = quote.vendor_lead?.vendor;
    const lead = quote.vendor_lead?.lead;
    const config = statusConfig[quote.status] || statusConfig.sent;
    const isExpired =
      quote.valid_until && new Date(quote.valid_until) < new Date();

    return (
      <Link
        href={`/account/quotes/${quote.id}`}
        className="block rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          {/* Vendor Logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-leaf-100">
            {vendor?.logo_url ? (
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name || ""}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-leaf-600">
                {vendor?.business_name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>

          {/* İçerik */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {vendor?.business_name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {lead?.event_date && (
                    <span>
                      📅{" "}
                      {new Date(lead.event_date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  )}
                  {lead?.guest_count && <span>👥 {lead.guest_count} kişi</span>}
                  {lead?.service_style && (
                    <span>{serviceStyleLabels[lead.service_style]}</span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
              >
                {isExpired && quote.status === "sent"
                  ? "Süresi Doldu"
                  : config.label}
              </span>
            </div>

            {/* Fiyat */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-leaf-600">
                  {quote.total_price.toLocaleString("tr-TR")} ₺
                </p>
                {quote.price_per_person && (
                  <p className="text-sm text-slate-500">
                    Kişi başı: {quote.price_per_person.toLocaleString("tr-TR")}{" "}
                    ₺
                  </p>
                )}
              </div>
              {quote.valid_until && !isExpired && quote.status === "sent" && (
                <p className="text-xs text-slate-500">
                  Geçerlilik:{" "}
                  {new Date(quote.valid_until).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Tekliflerim</h1>
        <p className="mt-1 text-slate-500">
          Firmalardan aldığınız teklifleri görüntüleyin
        </p>

        {quoteList.length > 0 ? (
          <div className="mt-8 space-y-8">
            {/* Bekleyen Teklifler */}
            {pendingQuotes.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                    {pendingQuotes.length}
                  </span>
                  Bekleyen Teklifler
                </h2>
                <div className="space-y-4">
                  {pendingQuotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
              </div>
            )}

            {/* Kabul Edilen Teklifler */}
            {acceptedQuotes.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
                    {acceptedQuotes.length}
                  </span>
                  Kabul Edilen Teklifler
                </h2>
                <div className="space-y-4">
                  {acceptedQuotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
              </div>
            )}

            {/* Reddedilen Teklifler */}
            {otherQuotes.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">
                    {otherQuotes.length}
                  </span>
                  Reddedilen Teklifler
                </h2>
                <div className="space-y-4">
                  {otherQuotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Henüz teklif almadınız
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Catering firmalarından teklif almak için firma sayfalarını ziyaret
              edin.
            </p>
            <Link
              href="/vendors"
              className="mt-6 rounded-lg bg-leaf-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-leaf-700"
            >
              Firma Ara
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
