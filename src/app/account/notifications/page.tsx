// src/app/account/notifications/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import NotificationSettings from "./NotificationSettings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bildirim Ayarları | Cateringle",
  description: "Bildirim tercihlerinizi yönetin",
};

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/notifications");
  }

  // Bildirim tercihlerini al
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Tüm bildirimleri al
  const { data: notificationsResult } = await supabase.rpc(
    "get_user_notifications",
    {
      p_user_id: user.id,
      p_limit: 50,
      p_offset: 0,
      p_unread_only: false,
    }
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Bildirimler</h1>

        <NotificationSettings
          userId={user.id}
          initialPreferences={preferences}
          initialNotifications={notificationsResult?.notifications || []}
          totalCount={notificationsResult?.total_count || 0}
        />
      </div>
    </main>
  );
}
