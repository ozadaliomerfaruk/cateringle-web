// src/app/vendor/analytics/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AnalyticsDashboard from "./AnalyticsDashboard";
import type { VendorAnalytics } from "@/lib/types/analytics";

export const metadata: Metadata = {
  title: "Analitik | Firma Paneli",
  description: "Firma performans analizi ve istatistikler",
};

export const dynamic = "force-dynamic";

export default async function VendorAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/analytics");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  if (vendor.status !== "approved") {
    redirect("/vendor");
  }

  // Fetch analytics data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: analyticsData, error } = await (supabase.rpc as any)(
    "get_vendor_analytics",
    {
      p_vendor_id: vendor.id,
      p_days: 30,
    }
  );

  if (error) {
    console.error("Analytics fetch error:", error);
  }

  // Type guard for analytics data
  const isValidAnalytics = (data: unknown): data is VendorAnalytics => {
    return (
      data !== null &&
      typeof data === "object" &&
      "summary" in data &&
      "leads_by_day" in data
    );
  };

  const analytics: VendorAnalytics = isValidAnalytics(analyticsData)
    ? analyticsData
    : {
    summary: {
      total_leads: 0,
      total_quotes: 0,
      accepted_quotes: 0,
      pending_quotes: 0,
      rejected_quotes: 0,
      total_messages: 0,
      unread_messages: 0,
      avg_response_time_hours: null,
      conversion_rate: 0,
    },
    leads_by_day: [],
    quotes_by_day: [],
    leads_by_event_type: [],
    quotes_by_status: [],
    monthly_comparison: {
      current_month_leads: 0,
      last_month_leads: 0,
      current_month_quotes: 0,
      last_month_quotes: 0,
    },
    guest_count_distribution: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analitik</h1>
        <p className="mt-1 text-sm text-slate-500">
          Son 30 günlük performans verileriniz
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard analytics={analytics} />
    </div>
  );
}
