import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Cateringle.com yönetim paneli",
};

// Tip tanımı
type RecentReview = {
  id: string;
  customer_name: string;
  rating: number;
  created_at: string | null;
  is_approved: boolean | null;
  vendor: { business_name: string } | null;
};

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/panel");
  }

  // RBAC kontrolü
  const hasAdminAccess = await isAdmin(supabase, user.id);
  if (!hasAdminAccess) {
    redirect("/");
  }

  // İstatistikler
  const { count: totalVendors } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true });

  const { count: pendingVendors } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const { count: totalReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const { count: pendingReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false);

  // Son başvurular
  const { data: recentApplications } = await supabase
    .from("vendors")
    .select("id, business_name, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  // Son yorumlar
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(
      "id, customer_name, rating, created_at, is_approved, vendor:vendors(business_name)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const typedRecentReviews = recentReviews as RecentReview[] | null;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="mt-1 text-slate-500">
            Hoş geldiniz! Platformunuzun genel durumu aşağıda.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalVendors || 0}
                </p>
                <p className="text-sm text-slate-500">Toplam Firma</p>
              </div>
            </div>
            {(pendingVendors || 0) > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-yellow-700">
                  {pendingVendors} onay bekliyor
                </span>
              </div>
            )}
          </div>

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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalUsers || 0}
                </p>
                <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalLeads || 0}
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalReviews || 0}
                </p>
                <p className="text-sm text-slate-500">Toplam Yorum</p>
              </div>
            </div>
            {(pendingReviews || 0) > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-yellow-700">
                  {pendingReviews} onay bekliyor
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Recent Items */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Quick Links */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Hizli Erisim</h2>
            <div className="mt-4 space-y-2">
              {[
                {
                  href: "/panel/users?tab=pending",
                  label: "Bekleyen Basvurular",
                  icon: (
                    <svg
                      className="h-5 w-5 text-amber-600"
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
                  badge: pendingVendors,
                },
                {
                  href: "/panel/users?tab=vendors",
                  label: "Tum Firmalar",
                  icon: (
                    <svg
                      className="h-5 w-5 text-leaf-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  ),
                },
                {
                  href: "/panel/users?tab=users",
                  label: "Kullanicilar",
                  icon: (
                    <svg
                      className="h-5 w-5 text-purple-600"
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
                  ),
                },
                {
                  href: "/panel/reviews",
                  label: "Yorumlar",
                  icon: (
                    <svg
                      className="h-5 w-5 text-yellow-600"
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
                  ),
                  badge: pendingReviews,
                },
                {
                  href: "/panel/leads",
                  label: "Teklif Talepleri",
                  icon: (
                    <svg
                      className="h-5 w-5 text-indigo-600"
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
                  ),
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-leaf-50"
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                      {item.badge}
                    </span>
                  ) : (
                    <svg
                      className="h-5 w-5 text-slate-400"
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
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Son Basvurular</h2>
              <Link
                href="/panel/users?tab=pending"
                className="text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                Tumu
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {app.business_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(app.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status === "pending"
                        ? "Bekliyor"
                        : app.status === "approved"
                        ? "Onaylı"
                        : "Reddedildi"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-4">
                  Henüz başvuru yok
                </p>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Son Yorumlar</h2>
              <Link
                href="/panel/reviews"
                className="text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                Tümü
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {typedRecentReviews && typedRecentReviews.length > 0 ? (
                typedRecentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {review.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {review.vendor?.business_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm">
                        <svg
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {review.rating}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          review.is_approved ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-4">
                  Henüz yorum yok
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
