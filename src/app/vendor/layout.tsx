import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LogoutButton from "../../components/LogoutButton";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "vendor_owner") {
    redirect("/");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Üst navigasyon */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/vendor"
              className="text-lg font-semibold text-emerald-700"
            >
              Firma Paneli
            </Link>
            <div className="hidden items-center gap-4 text-sm md:flex">
              <Link
                href="/vendor"
                className="text-slate-600 hover:text-slate-900"
              >
                Gelen Teklifler
              </Link>
              <Link
                href="/vendor/menu"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-slate-100"
              >
                <svg
                  className="h-4 w-4 text-slate-500"
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
              <Link
                href="/vendor/settings"
                className="text-slate-600 hover:text-slate-900"
              >
                Firma Ayarları
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 md:inline">
              {vendor?.business_name}
            </span>
            <Link
              href="/"
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Siteye Dön
            </Link>
            <LogoutButton />
          </div>
        </div>
        {/* Mobil menü */}
        <div className="flex items-center justify-between gap-4 border-t px-4 py-2 text-xs md:hidden">
          <div className="flex gap-4">
            <Link
              href="/vendor"
              className="text-slate-600 hover:text-slate-900"
            >
              Teklifler
            </Link>
            <Link
              href="/vendor/settings"
              className="text-slate-600 hover:text-slate-900"
            >
              Ayarlar
            </Link>
          </div>
          <LogoutButton className="text-xs text-red-600 hover:text-red-700" />
        </div>
      </nav>

      {/* İçerik */}
      {children}
    </div>
  );
}
