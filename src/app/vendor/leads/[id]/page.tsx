import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import QuoteForm from "./QuoteForm";
import { sendQuoteNotification } from "@/lib/email";

export const metadata: Metadata = {
  title: "Talep Detayı | Firma Paneli",
  description: "Teklif talebi detayları",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/leads");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  // Talep detayı
  const { data: vendorLead } = await supabase
    .from("vendor_leads")
    .select(
      `
      id,
      lead_id,
      status,
      vendor_note,
      created_at,
      viewed_at,
      lead:leads (
        id,
        customer_name,
        customer_email,
        customer_phone,
        event_date,
        event_type,
        guest_count,
        budget_min,
        budget_max,
        service_style,
        notes,
        needs_service_staff,
        needs_cleanup,
        needs_tables_chairs,
        wants_real_tableware,
        wants_disposable_tableware,
        cuisine_preference,
        delivery_model,
        dietary_requirements,
        created_at,
        segment:customer_segments (id, name, slug),
        city:cities (name),
        district:districts (name)
      ),
      quotes (
        id,
        status,
        total_price,
        price_per_person,
        message,
        valid_until,
        sent_at,
        created_at
      )
    `
    )
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .maybeSingle();

  if (!vendorLead) {
    notFound();
  }

  // Görüldü olarak işaretle
  if (!vendorLead.viewed_at) {
    await supabaseAdmin
      .from("vendor_leads")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id);
  }

  const lead = vendorLead.lead as {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    event_date: string | null;
    event_type: string | null;
    guest_count: number | null;
    budget_min: number | null;
    budget_max: number | null;
    service_style: string | null;
    notes: string | null;
    needs_service_staff: boolean | null;
    needs_cleanup: boolean | null;
    needs_tables_chairs: boolean | null;
    wants_real_tableware: boolean | null;
    wants_disposable_tableware: boolean | null;
    cuisine_preference: string | null;
    delivery_model: string | null;
    dietary_requirements: string[] | null;
    created_at: string;
    segment: { id: number; name: string; slug: string } | null;
    city: { name: string } | null;
    district: { name: string } | null;
  };

  const quotes = vendorLead.quotes || [];
  const activeQuote = quotes.find((q) =>
    ["sent", "viewed", "accepted"].includes(q.status)
  );

  // Teklif gönderme action
  async function sendQuote(formData: FormData) {
    "use server";

    const vendorLeadId = formData.get("vendor_lead_id") as string;
    const totalPrice = parseFloat(formData.get("total_price") as string);
    const pricePerPerson = formData.get("price_per_person")
      ? parseFloat(formData.get("price_per_person") as string)
      : null;
    const message = formData.get("message") as string;
    const validUntil = formData.get("valid_until") as string;

    const { data: quote, error } = await supabaseAdmin
      .from("quotes")
      .insert({
        vendor_lead_id: vendorLeadId,
        total_price: totalPrice,
        price_per_person: pricePerPerson,
        message: message || null,
        valid_until: validUntil || null,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Teklif oluşturma hatası:", error);
      return;
    }

    // vendor_leads durumunu güncelle
    await supabaseAdmin
      .from("vendor_leads")
      .update({ status: "quoted" })
      .eq("id", vendorLeadId);

    // Müşteriye email gönder
    sendQuoteNotification({
      customerEmail: lead.customer_email,
      customerName: lead.customer_name,
      vendorName: vendor.business_name,
      totalPrice: totalPrice,
      pricePerPerson: pricePerPerson,
      guestCount: lead.guest_count,
      message: message,
      validUntil: validUntil,
      quoteId: quote.id,
    }).catch((err) => console.error("Quote notification email error:", err));

    revalidatePath(`/vendor/leads/${vendorLeadId}`);
    revalidatePath("/vendor/leads");
  }

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
    self_service: "Self Servis",
  };

  const cuisineLabels: Record<string, string> = {
    "turk-mutfagi": "Türk Mutfağı",
    "osmanli-saray": "Osmanlı / Saray Mutfağı",
    "ege-akdeniz": "Ege & Akdeniz",
    "guneydogu-antep": "Güneydoğu / Antep",
    karadeniz: "Karadeniz",
    italyan: "İtalyan",
    fransiz: "Fransız",
    asya: "Asya (Uzakdoğu)",
    meksika: "Meksika",
    hint: "Hint",
    "fine-dining": "Fine Dining",
    fusion: "Fusion",
    "vegan-raw": "Vegan / Raw",
    "saglikli-diyet": "Sağlıklı / Diyet",
    "street-food": "Street Food",
  };

  const deliveryLabels: Record<string, string> = {
    "drop-off": "Drop-off (Kapıda Teslimat)",
    "hot-delivery": "Sıcak Teslimat",
    "full-service": "Full Service (Servis Dahil)",
    "live-cooking": "Live Cooking / Show Kitchen",
    pickup: "Gel-Al (Pickup)",
  };

  const dietaryLabels: Record<string, string> = {
    vejetaryen: "Vejetaryen",
    vegan: "Vegan",
    glutensiz: "Glütensiz",
    laktozsuz: "Laktozsuz",
    "dusuk-karbonhidrat": "Düşük Karbonhidrat",
    "cocuk-menusu": "Çocuk Menüsü",
  };

  const quoteStatusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Taslak", color: "bg-slate-100 text-slate-600" },
    sent: { label: "Gönderildi", color: "bg-blue-100 text-blue-700" },
    viewed: { label: "Görüntülendi", color: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Kabul Edildi", color: "bg-green-100 text-green-700" },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
    expired: { label: "Süresi Doldu", color: "bg-slate-100 text-slate-600" },
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href="/vendor/leads"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
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
            Taleplere Dön
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {lead.customer_name}
                </h1>
                {lead.segment && (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      lead.segment.slug === "kurumsal"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-leaf-100 text-leaf-700"
                    }`}
                  >
                    {lead.segment.slug === "kurumsal" ? "🏢" : "🎉"}{" "}
                    {lead.segment.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-500">
                {new Date(vendorLead.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                tarihinde gönderildi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol - Talep Detayları */}
          <div className="space-y-6 lg:col-span-2">
            {/* Etkinlik Bilgileri */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">
                Etkinlik Bilgileri
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {lead.event_date && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Etkinlik Tarihi</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {new Date(lead.event_date).toLocaleDateString("tr-TR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {lead.guest_count && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Kişi Sayısı</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {lead.guest_count} kişi
                    </p>
                  </div>
                )}
                {lead.service_style && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Servis Tarzı</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {serviceStyleLabels[lead.service_style] ||
                        lead.service_style}
                    </p>
                  </div>
                )}
                {(lead.budget_min || lead.budget_max) && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Bütçe Aralığı</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {lead.budget_min?.toLocaleString("tr-TR")} -{" "}
                      {lead.budget_max?.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                )}
                {(lead.city || lead.district) && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Konum</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {[lead.district?.name, lead.city?.name]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ek Hizmetler */}
            {(lead.needs_service_staff ||
              lead.needs_cleanup ||
              lead.needs_tables_chairs ||
              lead.wants_real_tableware ||
              lead.wants_disposable_tableware) && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  İstenen Ek Hizmetler
                </h2>
                <div className="flex flex-wrap gap-2">
                  {lead.needs_service_staff && (
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700">
                      ✓ Servis Personeli
                    </span>
                  )}
                  {lead.needs_cleanup && (
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700">
                      ✓ Temizlik
                    </span>
                  )}
                  {lead.needs_tables_chairs && (
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700">
                      ✓ Masa & Sandalye
                    </span>
                  )}
                  {lead.wants_real_tableware && (
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700">
                      ✓ Porselen Tabak
                    </span>
                  )}
                  {lead.wants_disposable_tableware && (
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700">
                      ✓ Tek Kullanımlık
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Müşteri Tercihleri */}
            {(lead.cuisine_preference ||
              lead.delivery_model ||
              (lead.dietary_requirements &&
                lead.dietary_requirements.length > 0)) && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  Müşteri Tercihleri
                </h2>
                <div className="space-y-4">
                  {lead.cuisine_preference && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍽️</span>
                      <div>
                        <p className="text-xs text-slate-500">Mutfak Tercihi</p>
                        <p className="font-medium text-slate-900">
                          {cuisineLabels[lead.cuisine_preference] ||
                            lead.cuisine_preference}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.delivery_model && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚚</span>
                      <div>
                        <p className="text-xs text-slate-500">
                          Teslimat Tercihi
                        </p>
                        <p className="font-medium text-slate-900">
                          {deliveryLabels[lead.delivery_model] ||
                            lead.delivery_model}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.dietary_requirements &&
                    lead.dietary_requirements.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-slate-500">
                          Diyet Gereksinimleri
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lead.dietary_requirements.map((req, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700"
                            >
                              {dietaryLabels[req] || req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Notlar */}
            {lead.notes && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  Müşteri Notları
                </h2>
                <p className="whitespace-pre-wrap text-slate-600">
                  {lead.notes}
                </p>
              </div>
            )}

            {/* Mevcut Teklifler */}
            {quotes.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  Gönderilen Teklifler
                </h2>
                <div className="space-y-3">
                  {quotes.map((quote) => {
                    const statusConfig =
                      quoteStatusLabels[quote.status] ||
                      quoteStatusLabels.draft;
                    return (
                      <div
                        key={quote.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">
                              {quote.total_price.toLocaleString("tr-TR")} ₺
                            </p>
                            {quote.price_per_person && (
                              <p className="text-sm text-slate-500">
                                Kişi başı:{" "}
                                {quote.price_per_person.toLocaleString("tr-TR")}{" "}
                                ₺
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        {quote.message && (
                          <p className="mt-3 text-sm text-slate-600">
                            {quote.message}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                          {quote.sent_at && (
                            <span>
                              Gönderildi:{" "}
                              {new Date(quote.sent_at).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          )}
                          {quote.valid_until && (
                            <span>
                              Geçerlilik:{" "}
                              {new Date(quote.valid_until).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sağ - İletişim & Teklif Formu */}
          <div className="space-y-6">
            {/* İletişim Bilgileri */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">İletişim</h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${lead.customer_email}`}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-slate-700 transition-colors hover:bg-slate-100"
                >
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">{lead.customer_email}</span>
                </a>
                {lead.customer_phone && (
                  <>
                    <a
                      href={`tel:${lead.customer_phone}`}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-slate-700 transition-colors hover:bg-slate-100"
                    >
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-sm">{lead.customer_phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/90${lead.customer_phone.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-green-700 transition-colors hover:bg-green-100"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="text-sm font-medium">
                        WhatsApp ile Yaz
                      </span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Teklif Formu */}
            {!activeQuote ? (
              <QuoteForm
                vendorLeadId={vendorLead.id}
                guestCount={lead.guest_count}
                sendQuoteAction={sendQuote}
              />
            ) : (
              <div className="rounded-xl bg-leaf-50 p-6">
                <div className="flex items-center gap-3">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-leaf-900">
                      Teklif Gönderildi
                    </p>
                    <p className="text-sm text-leaf-700">
                      {activeQuote.total_price.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
