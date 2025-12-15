// src/app/panel/analytics/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";
import type { AdminAnalytics } from "@/lib/types/admin-analytics";

export const metadata: Metadata = {
  title: "Platform Analitik | Admin Panel",
  description: "Platform genelinde istatistikler ve analizler",
};

export const dynamic = "force-dynamic";

const emptyAnalytics: AdminAnalytics = {
  summary: {
    total_vendors: 0,
    approved_vendors: 0,
    pending_vendors: 0,
    total_users: 0,
    total_leads: 0,
    total_quotes: 0,
    accepted_quotes: 0,
    total_reviews: 0,
    pending_reviews: 0,
    total_messages: 0,
    platform_conversion_rate: 0,
  },
  leads_by_day: [],
  vendors_by_day: [],
  quotes_by_day: [],
  vendors_by_city: [],
  vendors_by_category: [],
  top_vendors_by_leads: [],
  monthly_comparison: {
    current_month_leads: 0,
    last_month_leads: 0,
    current_month_vendors: 0,
    last_month_vendors: 0,
    current_month_quotes: 0,
    last_month_quotes: 0,
    current_month_users: 0,
    last_month_users: 0,
  },
  leads_by_event_type: [],
  quotes_by_status: [],
  weekly_activity: {
    new_leads: 0,
    new_vendors: 0,
    new_quotes: 0,
    new_messages: 0,
    new_reviews: 0,
  },
};

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/panel/analytics");
  }

  // RBAC kontrolü
  const hasAdminAccess = await isAdmin(supabase, user.id);
  if (!hasAdminAccess) {
    redirect("/");
  }

  // Fetch analytics data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: analyticsData, error } = await (supabase.rpc as any)(
    "get_admin_analytics",
    { p_days: 30 }
  );

  if (error) {
    console.error("Admin analytics fetch error:", error);
  }

  // Type guard for analytics data
  const isValidAnalytics = (data: unknown): data is AdminAnalytics => {
    return (
      data !== null &&
      typeof data === "object" &&
      "summary" in data &&
      "leads_by_day" in data
    );
  };

  const analytics: AdminAnalytics = isValidAnalytics(analyticsData)
    ? analyticsData
    : emptyAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Analitik</h1>
        <p className="mt-1 text-sm text-slate-500">
          Son 30 günlük platform istatistikleri
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AdminAnalyticsDashboard analytics={analytics} />
    </div>
  );
}
