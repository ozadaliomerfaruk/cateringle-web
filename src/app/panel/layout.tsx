import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/panel");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  const navGroups = [
    {
      title: "Genel",
      items: [
        { href: "/panel", label: "Dashboard" },
        { href: "/panel/vendor-applications", label: "Başvurular" },
        { href: "/panel/vendors", label: "Firmalar" },
        { href: "/panel/users", label: "Kullanıcılar" },
        { href: "/panel/leads", label: "Talepler" },
        { href: "/panel/reviews", label: "Yorumlar" },
      ],
    },
    {
      title: "Katalog",
      items: [
        { href: "/panel/categories", label: "Kategoriler" },
        { href: "/panel/segments", label: "Segmentler" },
        { href: "/panel/cuisines", label: "Mutfak Türleri" },
        { href: "/panel/delivery-models", label: "Teslimat" },
        { href: "/panel/services", label: "Hizmetler" },
        { href: "/panel/tags", label: "Etiketler" },
      ],
    },
    {
      title: "Konum",
      items: [
        { href: "/panel/cities", label: "Şehirler" },
        { href: "/panel/districts", label: "İlçeler" },
      ],
    },
    {
      title: "İçerik",
      items: [
        { href: "/panel/blogs", label: "Blog" },
        { href: "/panel/settings", label: "Ayarlar" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/panel" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600 text-sm font-bold text-white">
                C
              </span>
              <span className="hidden font-bold text-slate-900 sm:block">
                Admin Panel
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Siteyi Gör
            </Link>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-600 text-xs font-bold text-white">
                {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {profile.full_name || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t">
          <nav className="flex items-center gap-1 overflow-x-auto px-4 py-2">
            {navGroups.map((group, groupIdx) => (
              <div key={group.title} className="flex shrink-0 items-center">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-leaf-50 hover:text-leaf-700"
                  >
                    {item.label}
                  </Link>
                ))}
                {groupIdx < navGroups.length - 1 && (
                  <div className="mx-2 h-4 w-px bg-slate-300" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
