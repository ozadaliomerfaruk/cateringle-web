import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    .select("role, full_name")
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
      .select("role, full_name")
      .single();

    if (insertError) {
      console.error("Profile creation error:", insertError);
      redirect("/");
    }
    profile = newProfile;
  }

  // Rol kontrolü
  if (profile.role !== "customer") {
    if (profile.role === "vendor_owner") redirect("/vendor");
    if (profile.role === "admin") redirect("/panel");
    redirect("/");
  }

  // Bekleyen teklif sayısı
  const { count: pendingQuoteCount } = await supabase
    .from("quotes")
    .select(
      "*, vendor_lead:vendor_leads!inner(lead:leads!inner(customer_profile_id))",
      { count: "exact", head: true }
    )
    .eq("vendor_lead.lead.customer_profile_id", user.id)
    .eq("status", "sent");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Üst navigasyon */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/account"
              className="text-lg font-semibold text-leaf-700"
            >
              Hesabım
            </Link>
            <Link
              href="/account/favorites"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-slate-100"
            >
              <svg
                className="h-4 w-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Favorilerim
            </Link>
            <div className="hidden items-center gap-4 text-sm md:flex">
              <Link
                href="/account/quotes"
                className="relative text-slate-600 hover:text-slate-900"
              >
                Tekliflerim
                {(pendingQuoteCount || 0) > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-leaf-500 text-[10px] font-bold text-white">
                    {pendingQuoteCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account/profile"
                className="text-slate-600 hover:text-slate-900"
              >
                Profil
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 md:inline">
              {profile?.full_name || user.email}
            </span>
            <Link
              href="/vendors"
              className="rounded-md bg-leaf-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-leaf-700"
            >
              Firma Bul
            </Link>
          </div>
        </div>
        {/* Mobil menü */}
        <div className="flex items-center justify-center gap-4 border-t px-4 py-2 text-xs md:hidden">
          <Link
            href="/account/quotes"
            className="relative text-slate-600 hover:text-slate-900"
          >
            Tekliflerim
            {(pendingQuoteCount || 0) > 0 && (
              <span className="absolute -right-2 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-leaf-500 text-[8px] font-bold text-white">
                {pendingQuoteCount}
              </span>
            )}
          </Link>
          <Link
            href="/account/profile"
            className="text-slate-600 hover:text-slate-900"
          >
            Profil
          </Link>
        </div>
      </nav>

      {/* İçerik */}
      {children}
    </div>
  );
}
