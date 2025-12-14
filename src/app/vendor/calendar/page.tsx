// src/app/vendor/calendar/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CalendarManager from "./CalendarManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Takvim Yönetimi | Vendor Panel",
  description: "Müsaitlik durumunuzu ve rezervasyonlarınızı yönetin",
};

export default async function VendorCalendarPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/calendar");
  }

  // Vendor bilgilerini al
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    redirect("/vendor");
  }

  // Haftalık müsaitlik ayarlarını al
  const { data: availability } = await supabase
    .from("vendor_availability")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("day_of_week");

  // Bu ay ve sonraki 2 ay için bloke tarihleri al
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const { data: blockedDates } = await supabase
    .from("vendor_blocked_dates")
    .select("*")
    .eq("vendor_id", vendor.id)
    .gte("blocked_date", today.toISOString().split("T")[0])
    .lte("blocked_date", threeMonthsLater.toISOString().split("T")[0])
    .order("blocked_date");

  // Gelecek rezervasyonları al
  const { data: bookings } = await supabase
    .from("vendor_bookings")
    .select("*")
    .eq("vendor_id", vendor.id)
    .gte("event_date", today.toISOString().split("T")[0])
    .eq("status", "confirmed")
    .order("event_date");

  return (
    <main className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Takvim Yönetimi</h1>
          <p className="mt-1 text-slate-600">
            Müsaitlik durumunuzu ve rezervasyonlarınızı yönetin
          </p>
        </div>

        <CalendarManager
          vendorId={vendor.id}
          initialAvailability={availability || []}
          initialBlockedDates={blockedDates || []}
          initialBookings={bookings || []}
        />
      </div>
    </main>
  );
}
