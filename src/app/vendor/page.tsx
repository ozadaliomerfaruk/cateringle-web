import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Firma Paneli",
  description: "Cateringle.com firma yönetim paneli",
};

// Tip tanımları
type RecentLead = {
  id: string;
  customer_name: string;
  service_style: string | null;
  event_date: string | null;
  guest_count: number | null;
  created_at: string;
};

export default async function VendorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  // İstatistikler - vendor_leads üzerinden lead sayısı
  const { count: leadCount } = await supabase
    .from("vendor_leads")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendor.id);

  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendor.id)
    .eq("is_approved", true);

  const { data: ratingData } = await supabase
    .from("vendor_ratings")
    .select("avg_rating")
    .eq("vendor_id", vendor.id)
    .maybeSingle();

  const { count: imageCount } = await supabase
    .from("vendor_images")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendor.id);

  // Son teklif talepleri - vendor_leads üzerinden join
  const { data: vendorLeadsData } = await supabase
    .from("vendor_leads")
    .select(
      `
      id,
      created_at,
      lead:leads (
        id,
        customer_name,
        service_style,
        event_date,
        guest_count,
        created_at
      )
    `
    )
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Lead verilerini düzleştir
  const recentLeads: RecentLead[] =
    vendorLeadsData
      ?.map((vl) => {
        const lead = vl.lead as {
          id: string;
          customer_name: string;
          service_style: string | null;
          event_date: string | null;
          guest_count: number | null;
          created_at: string;
        } | null;
        if (!lead) return null;
        return {
          id: lead.id,
          customer_name: lead.customer_name,
          service_style: lead.service_style,
          event_date: lead.event_date,
          guest_count: lead.guest_count,
          created_at: lead.created_at,
        };
      })
      .filter((lead): lead is RecentLead => lead !== null) || [];

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Onay Bekliyor",
      color: "bg-yellow-100 text-yellow-700",
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    approved: {
      label: "Aktif",
      color: "bg-green-100 text-green-700",
      icon: (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    rejected: {
      label: "Reddedildi",
      color: "bg-red-100 text-red-700",
      icon: (
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
  };

  const serviceStyleLabels: Record<string, string> = {
    open_buffet: "Açık Büfe",
    cocktail: "Kokteyl",
    plated: "Oturmalı Menü",
    coffee_break: "Coffee Break",
    lunchbox: "Lunchbox",
    self_service: "Self Servis",
  };

  const status = statusConfig[vendor.status] || statusConfig.pending;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {vendor.business_name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                >
                  {status.icon} {status.label}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                Firma yönetim panelinize hoş geldiniz
              </p>
            </div>
            {vendor.status === "approved" && vendor.slug && (
              <Link
                href={`/vendors/${vendor.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Profili Görüntüle
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Pending Warning */}
        {vendor.status === "pending" && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl bg-yellow-50 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">
                Başvurunuz İnceleniyor
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Firma profiliniz henüz onaylanmadı. Onay sürecinde bilgilerinizi
                tamamlayabilirsiniz. Onaylandığında profiliniz yayına alınacak
                ve teklif talepleri almaya başlayacaksınız.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {leadCount || 0}
                </p>
                <p className="text-sm text-slate-500">Teklif Talebi</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {ratingData?.avg_rating
                    ? ratingData.avg_rating.toFixed(1)
                    : "-"}
                </p>
                <p className="text-sm text-slate-500">Puan</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {reviewCount || 0}
                </p>
                <p className="text-sm text-slate-500">Yorum</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-100">
                <svg
                  className="h-6 w-6 text-leaf-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {imageCount || 0}
                </p>
                <p className="text-sm text-slate-500">Fotoğraf</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol - Hızlı Erişim */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Hızlı Erişim</h2>
              <div className="mt-4 space-y-2">
                <Link
                  href="/vendor/settings"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-leaf-50 hover:text-leaf-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Firma Ayarları
                </Link>
                <Link
                  href="/vendor/menu"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-leaf-50 hover:text-leaf-700"
                >
                  <svg
                    className="h-5 w-5"
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
                  Menü & Paketler
                </Link>
              </div>

              {/* Profil Tamamlama */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-medium text-slate-700">
                  Profil Durumu
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {vendor.logo_url ? (
                      <svg
                        className="h-4 w-4 text-green-500"
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
                    ) : (
                      <svg
                        className="h-4 w-4 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={
                        vendor.logo_url ? "text-slate-700" : "text-slate-400"
                      }
                    >
                      Logo yüklendi
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {vendor.description ? (
                      <svg
                        className="h-4 w-4 text-green-500"
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
                    ) : (
                      <svg
                        className="h-4 w-4 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={
                        vendor.description ? "text-slate-700" : "text-slate-400"
                      }
                    >
                      Açıklama eklendi
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {(imageCount || 0) > 0 ? (
                      <svg
                        className="h-4 w-4 text-green-500"
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
                    ) : (
                      <svg
                        className="h-4 w-4 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={
                        (imageCount || 0) > 0
                          ? "text-slate-700"
                          : "text-slate-400"
                      }
                    >
                      Fotoğraflar eklendi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ - Son Talepler */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Son Teklif Talepleri
                </h2>
              </div>

              {recentLeads.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 font-semibold text-leaf-700">
                          {lead.customer_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.customer_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {lead.service_style
                              ? serviceStyleLabels[lead.service_style] ||
                                lead.service_style
                              : "Belirtilmemiş"}{" "}
                            • {lead.guest_count || "?"} kişi
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {lead.event_date && (
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(lead.event_date).toLocaleDateString(
                              "tr-TR"
                            )}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {new Date(lead.created_at).toLocaleDateString(
                            "tr-TR"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
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
                  <p className="mt-4 font-medium text-slate-700">
                    Henüz teklif talebi yok
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Profiliniz onaylandığında teklif talepleri burada görünecek.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
