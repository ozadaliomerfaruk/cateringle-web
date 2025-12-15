// src/app/account/layout.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdmin, isVendor } from "@/lib/roles";
import {
  User,
  Heart,
  FileText,
  Bell,
  ChatCircle,
} from "@phosphor-icons/react/dist/ssr";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Profil yoksa oluştur (ilk giriş durumu)
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        role: "customer",
      })
      .select("full_name")
      .single();

    if (insertError) {
      console.error("Profile creation error:", insertError);
      redirect("/");
    }
    profile = newProfile;
  }

  // RBAC kontrolü - admin veya vendor ise yönlendir
  const hasAdminAccess = await isAdmin(supabase, user.id);
  if (hasAdminAccess) {
    redirect("/panel");
  }

  const hasVendorAccess = await isVendor(supabase, user.id);
  if (hasVendorAccess) {
    redirect("/vendor");
  }

  // Bekleyen teklif sayısı
  const { count: pendingQuoteCount } = await supabase
    .from("quotes")
    .select(
      "*, vendor_lead:vendor_leads!inner(lead:leads!inner(customer_profile_id))",
      { count: "exact", head: true }
    )
    .eq("vendor_lead.lead.customer_profile_id", user.id)
    .in("status", ["sent", "viewed"]);

  // Okunmamış mesaj sayısı
  const { data: unreadResult } = await supabase.rpc("get_unread_message_count");
  const unreadMessageCount =
    (unreadResult as { ok: boolean; data?: { unread_count: number } } | null)
      ?.data?.unread_count || 0;

  const navItems = [
    {
      href: "/account",
      label: "Hesabım",
      icon: <User size={20} weight="regular" />,
    },
    {
      href: "/account/favorites",
      label: "Favorilerim",
      icon: <Heart size={20} weight="regular" />,
    },
    {
      href: "/account/quotes",
      label: "Tekliflerim",
      badge: pendingQuoteCount || 0,
      icon: <FileText size={20} weight="regular" />,
    },
    {
      href: "/account/messages",
      label: "Mesajlar",
      badge: unreadMessageCount,
      icon: <ChatCircle size={20} weight="regular" />,
    },
    {
      href: "/account/notifications",
      label: "Bildirimler",
      icon: <Bell size={20} weight="regular" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Back */}
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Ana Sayfa</span>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white">
                {profile?.full_name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {profile?.full_name || user.email}
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="-mb-px flex gap-1 overflow-x-auto pb-px">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex shrink-0 items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-leaf-300 hover:text-leaf-700"
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
