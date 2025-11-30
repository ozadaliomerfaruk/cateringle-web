import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teklif Talepleri | Firma Paneli",
  description: "Gelen teklif taleplerini yönetin",
};

interface Lead {
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
  cuisine_preference: string | null;
  delivery_model: string | null;
  dietary_requirements: string[] | null;
  notes: string | null;
  created_at: string;
  segment?: { name: string; slug: string } | null;
}

interface VendorLead {
  id: string;
  lead_id: string;
  status: string;
  created_at: string;
  viewed_at: string | null;
  lead: Lead;
  quotes: { id: string; status: string; total_price: number }[];
}

export default async function VendorLeadsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/leads");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  // Talepler
  const { data: vendorLeads } = await supabase
    .from("vendor_leads")
    .select(
      `
      id,
      lead_id,
      status,
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
        cuisine_preference,
        delivery_model,
        dietary_requirements,
        notes,
        created_at,
        segment:customer_segments (name, slug)
      ),
      quotes (id, status, total_price)
    `
    )
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const leads = (vendorLeads as unknown as VendorLead[]) || [];

  // İstatistikler
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "sent" && !l.viewed_at).length,
    pending: leads.filter((l) => !l.quotes?.some((q) => q.status === "sent"))
      .length,
    quoted: leads.filter((l) => l.quotes?.some((q) => q.status === "sent"))
      .length,
  };

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
    self_service: "Self Servis",
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    sent: { label: "Yeni", color: "bg-blue-100 text-blue-700" },
    viewed: { label: "Görüldü", color: "bg-yellow-100 text-yellow-700" },
    quoted: {
      label: "Teklif Verildi",
      color: "bg-leaf-100 text-leaf-700",
    },
    accepted: { label: "Kabul Edildi", color: "bg-green-100 text-green-700" },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
  };

  const getLeadStatus = (lead: VendorLead) => {
    const hasQuote = lead.quotes?.some((q) => q.status === "sent");
    const acceptedQuote = lead.quotes?.some((q) => q.status === "accepted");
    const rejectedQuote = lead.quotes?.some((q) => q.status === "rejected");

    if (acceptedQuote) return "accepted";
    if (rejectedQuote) return "rejected";
    if (hasQuote) return "quoted";
    if (lead.viewed_at) return "viewed";
    return "sent";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Teklif Talepleri
          </h1>
          <p className="mt-1 text-slate-500">
            Gelen talepleri görüntüleyin ve teklif gönderin
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* İstatistikler */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Toplam Talep</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Yeni</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{stats.new}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Teklif Bekliyor</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Teklif Verildi</p>
            <p className="mt-1 text-3xl font-bold text-leaf-600">
              {stats.quoted}
            </p>
          </div>
        </div>

        {/* Liste */}
        {leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map((vendorLead) => {
              const lead = vendorLead.lead;
              const leadStatus = getLeadStatus(vendorLead);
              const config = statusConfig[leadStatus];
              const quote = vendorLead.quotes?.[0];

              return (
                <Link
                  key={vendorLead.id}
                  href={`/vendor/leads/${vendorLead.id}`}
                  className="block rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Sol - Müşteri bilgileri */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-lg font-semibold text-leaf-700">
                        {lead.customer_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {lead.customer_name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                          {lead.segment && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                lead.segment.slug === "kurumsal"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-leaf-50 text-leaf-600"
                              }`}
                            >
                              {lead.segment.slug === "kurumsal" ? "🏢" : "🎉"}{" "}
                              {lead.segment.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          {lead.service_style && (
                            <span>
                              {serviceStyleLabels[lead.service_style] ||
                                lead.service_style}
                            </span>
                          )}
                          {lead.guest_count && (
                            <span>{lead.guest_count} kişi</span>
                          )}
                          {lead.event_date && (
                            <span>
                              📅{" "}
                              {new Date(lead.event_date).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                          {lead.cuisine_preference && (
                            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs text-orange-600">
                              🍽️ {lead.cuisine_preference.replace(/-/g, " ")}
                            </span>
                          )}
                          {lead.dietary_requirements &&
                            lead.dietary_requirements.length > 0 && (
                              <span className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-600">
                                🥗 {lead.dietary_requirements.length} diyet
                              </span>
                            )}
                        </div>
                        {lead.budget_min && lead.budget_max && (
                          <p className="mt-1 text-sm text-slate-500">
                            💰 {lead.budget_min.toLocaleString("tr-TR")} -{" "}
                            {lead.budget_max.toLocaleString("tr-TR")} ₺
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sağ - Teklif & Tarih */}
                    <div className="flex items-center gap-4 sm:text-right">
                      {quote && (
                        <div className="rounded-lg bg-leaf-50 px-3 py-2">
                          <p className="text-xs text-leaf-600">Teklifiniz</p>
                          <p className="font-semibold text-leaf-700">
                            {quote.total_price.toLocaleString("tr-TR")} ₺
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-500">
                          {new Date(vendorLead.created_at).toLocaleDateString(
                            "tr-TR"
                          )}
                        </p>
                        <svg
                          className="ml-auto mt-1 h-5 w-5 text-slate-400"
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
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-medium text-slate-900">
              Henüz teklif talebi yok
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Profiliniz onaylandığında teklif talepleri burada görünecek.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
