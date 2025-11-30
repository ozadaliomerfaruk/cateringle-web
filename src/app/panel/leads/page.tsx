import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

// Tip tanımları
type VendorLead = {
  id: string;
  status: Database["public"]["Enums"]["vendor_lead_status"];
  vendor: {
    id: string;
    business_name: string;
    slug: string;
  } | null;
};

type LeadWithVendors = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  event_date: string | null;
  guest_count: number | null;
  budget_min: number | null;
  budget_max: number | null;
  service_style: Database["public"]["Enums"]["service_style"] | null;
  created_at: string;
  vendor_leads: VendorLead[];
};

export default async function AdminLeadsPage() {
  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select(
      `
      id,
      customer_name,
      customer_email,
      customer_phone,
      event_date,
      guest_count,
      budget_min,
      budget_max,
      service_style,
      created_at,
      vendor_leads (
        id,
        status,
        vendor:vendors (
          id,
          business_name,
          slug
        )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const typedLeads = leads as LeadWithVendors[] | null;

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    sent: { label: "Gönderildi", color: "bg-blue-100 text-blue-700" },
    seen: { label: "Görüldü", color: "bg-slate-100 text-slate-700" },
    contacted: {
      label: "İletişime Geçildi",
      color: "bg-amber-100 text-amber-700",
    },
    quoted: { label: "Teklif Verildi", color: "bg-purple-100 text-purple-700" },
    won: { label: "Kazanıldı", color: "bg-leaf-100 text-leaf-700" },
    lost: { label: "Kaybedildi", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Teklif Yönetimi</h1>
        <p className="text-sm text-slate-600">
          {typedLeads?.length || 0} teklif talebi listelendi
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Hata: {error.message}
        </div>
      )}

      <div className="space-y-3">
        {typedLeads?.map((lead) => (
          <article
            key={lead.id}
            className="rounded-lg border bg-white p-4 text-sm"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{lead.customer_name}</h3>
                <p className="text-xs text-slate-500">
                  {lead.customer_email}
                  {lead.customer_phone && ` • ${lead.customer_phone}`}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(lead.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              {lead.event_date && (
                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
                  <svg
                    className="h-3.5 w-3.5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(lead.event_date).toLocaleDateString("tr-TR")}
                </span>
              )}
              {lead.guest_count && (
                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
                  <svg
                    className="h-3.5 w-3.5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {lead.guest_count} kişi
                </span>
              )}
              {(lead.budget_min || lead.budget_max) && (
                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
                  <svg
                    className="h-3.5 w-3.5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {lead.budget_min || "?"} - {lead.budget_max || "?"} TL
                </span>
              )}
              {lead.service_style && (
                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
                  <svg
                    className="h-3.5 w-3.5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {serviceStyleLabels[lead.service_style] || lead.service_style}
                </span>
              )}
            </div>

            {/* Gönderilen Firmalar */}
            {lead.vendor_leads && lead.vendor_leads.length > 0 && (
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium text-slate-600">
                  Gönderilen Firmalar:
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.vendor_leads.map((vl) => {
                    const statusInfo = statusLabels[vl.status] || {
                      label: vl.status,
                      color: "bg-slate-100 text-slate-700",
                    };
                    return (
                      <div
                        key={vl.id}
                        className="flex items-center gap-2 rounded-md border bg-slate-50 px-2 py-1 text-xs"
                      >
                        <span className="font-medium">
                          {vl.vendor?.business_name || "Bilinmeyen"}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        ))}

        {(!typedLeads || typedLeads.length === 0) && (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-500">
            Henüz teklif talebi yok
          </div>
        )}
      </div>
    </div>
  );
}
