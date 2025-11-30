import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import QuoteActions from "./QuoteActions";

export const metadata: Metadata = {
  title: "Teklif Detayı | Hesabım",
  description: "Teklif detaylarını görüntüleyin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/quotes");
  }

  // Teklif detayını çek
  const { data: quote } = await supabase
    .from("quotes")
    .select(
      `
      *,
      vendor_lead:vendor_leads!inner (
        id,
        vendor:vendors (
          id,
          business_name,
          slug,
          logo_url,
          phone,
          whatsapp,
          email
        ),
        lead:leads!inner (
          id,
          customer_profile_id,
          customer_name,
          event_date,
          guest_count,
          service_style,
          budget_min,
          budget_max,
          notes,
          segment:customer_segments (name, slug)
        )
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!quote) {
    notFound();
  }

  // Yetki kontrolü
  const lead = quote.vendor_lead?.lead;
  if (lead?.customer_profile_id !== user.id) {
    redirect("/account/quotes");
  }

  // Görüntülendi olarak işaretle
  if (quote.status === "sent") {
    await supabaseAdmin
      .from("quotes")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", id);
  }

  // Kabul/Red action
  async function respondToQuote(formData: FormData) {
    "use server";

    const quoteId = formData.get("quote_id") as string;
    const action = formData.get("action") as string;
    const note = formData.get("note") as string;

    const newStatus = action === "accept" ? "accepted" : "rejected";

    await supabaseAdmin
      .from("quotes")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        customer_response_note: note || null,
      })
      .eq("id", quoteId);

    // TODO: Firmaya email gönder

    revalidatePath(`/account/quotes/${quoteId}`);
    revalidatePath("/account/quotes");
  }

  const vendor = quote.vendor_lead?.vendor;
  const isExpired =
    quote.valid_until && new Date(quote.valid_until) < new Date();
  const canRespond = ["sent", "viewed"].includes(quote.status) && !isExpired;

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    sent: { label: "Yeni Teklif", color: "text-blue-700", bg: "bg-blue-50" },
    viewed: {
      label: "Görüntülendi",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
    accepted: {
      label: "Kabul Edildi",
      color: "text-green-700",
      bg: "bg-green-50",
    },
    rejected: { label: "Reddedildi", color: "text-red-700", bg: "bg-red-50" },
    expired: {
      label: "Süresi Doldu",
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  };

  const currentStatus =
    isExpired && quote.status === "sent" ? "expired" : quote.status;
  const config = statusConfig[currentStatus] || statusConfig.sent;

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
    self_service: "Self Servis",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back */}
        <Link
          href="/account/quotes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tekliflere Dön
        </Link>

        {/* Firma Başlığı */}
        <div className={`rounded-2xl ${config.bg} p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              {vendor?.logo_url ? (
                <Image
                  src={vendor.logo_url}
                  alt={vendor.business_name || ""}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-leaf-600">
                  {vendor?.business_name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {vendor?.business_name}
                  </h1>
                  <p className={`mt-1 text-sm font-medium ${config.color}`}>
                    {config.label}
                  </p>
                </div>
                <Link
                  href={`/vendors/${vendor?.slug}`}
                  target="_blank"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Firmayı Görüntüle
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Fiyat */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Teklif Tutarı</h2>
          <p className="mt-2 text-4xl font-bold text-leaf-600">
            {quote.total_price.toLocaleString("tr-TR")} ₺
          </p>
          {quote.price_per_person && (
            <p className="mt-1 text-slate-500">
              Kişi başı: {quote.price_per_person.toLocaleString("tr-TR")} ₺
              {lead?.guest_count && ` × ${lead.guest_count} kişi`}
            </p>
          )}

          {/* Geçerlilik */}
          {quote.valid_until && (
            <div
              className={`mt-4 rounded-lg p-3 ${
                isExpired ? "bg-red-50" : "bg-slate-50"
              }`}
            >
              <p
                className={`text-sm ${
                  isExpired ? "text-red-600" : "text-slate-600"
                }`}
              >
                {isExpired
                  ? "⚠️ Bu teklifin süresi dolmuş"
                  : "⏰ Teklif geçerlilik tarihi:"}{" "}
                <span className="font-medium">
                  {new Date(quote.valid_until).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Etkinlik Bilgileri */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Etkinlik Bilgileri</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {lead?.event_date && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tarih</p>
                <p className="mt-1 font-medium text-slate-900">
                  {new Date(lead.event_date).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {lead?.guest_count && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Kişi Sayısı</p>
                <p className="mt-1 font-medium text-slate-900">
                  {lead.guest_count} kişi
                </p>
              </div>
            )}
            {lead?.service_style && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Servis Tarzı</p>
                <p className="mt-1 font-medium text-slate-900">
                  {serviceStyleLabels[lead.service_style] || lead.service_style}
                </p>
              </div>
            )}
            {lead?.segment && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Etkinlik Tipi</p>
                <p className="mt-1 font-medium text-slate-900">
                  {lead.segment.slug === "kurumsal" ? "🏢" : "🎉"}{" "}
                  {lead.segment.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Firma Mesajı */}
        {quote.message && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Firma Mesajı</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-600">
              {quote.message}
            </p>
          </div>
        )}

        {/* İletişim */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">İletişim</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {vendor?.phone && (
              <a
                href={`tel:${vendor.phone}`}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {vendor.phone}
              </a>
            )}
            {vendor?.whatsapp && (
              <a
                href={`https://wa.me/90${vendor.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700 hover:bg-green-200"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
            {vendor?.email && (
              <a
                href={`mailto:${vendor.email}`}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                E-posta
              </a>
            )}
          </div>
        </div>

        {/* Kabul/Red Butonları */}
        {canRespond && (
          <QuoteActions quoteId={quote.id} respondAction={respondToQuote} />
        )}

        {/* Kabul edildi mesajı */}
        {quote.status === "accepted" && (
          <div className="mt-6 rounded-2xl bg-green-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
            <h3 className="mt-4 font-semibold text-green-900">
              Bu teklifi kabul ettiniz
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Firma sizinle iletişime geçecektir.
            </p>
          </div>
        )}

        {/* Reddedildi mesajı */}
        {quote.status === "rejected" && (
          <div className="mt-6 rounded-2xl bg-slate-100 p-6 text-center">
            <p className="text-slate-600">Bu teklifi reddettin</p>
          </div>
        )}
      </div>
    </main>
  );
}
