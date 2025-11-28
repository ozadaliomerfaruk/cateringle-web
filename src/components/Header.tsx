// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type UserRole = "customer" | "vendor_owner" | "admin" | "super_admin";

interface UserProfile {
  email: string;
  role: UserRole;
}

// Kategori listesi - CaterSpot benzeri yapı
const categories = [
  { name: "Düğün", slug: "dugun", desc: "Unutulmaz düğünler için" },
  { name: "Nişan", slug: "nisan", desc: "Özel anlarınız için" },
  {
    name: "Kurumsal Etkinlik",
    slug: "kurumsal-etkinlik",
    desc: "Profesyonel organizasyonlar",
  },
  { name: "Doğum Günü", slug: "dogum-gunu", desc: "Kutlamalar için" },
  { name: "Mezuniyet", slug: "mezuniyet", desc: "Başarıyı kutlayın" },
  { name: "Kokteyl", slug: "kokteyl", desc: "Şık davetler için" },
];

export default function Header() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  const supabase = createBrowserSupabaseClient();

  // Dışarı tıklandığında dropdown'ı kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserProfile = useCallback(
    async (user: User | null) => {
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setUserProfile({
        email: user.email || "",
        role: (profile?.role as UserRole) || "customer",
      });

      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      await getUserProfile(user);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      await getUserProfile(session?.user ?? null);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, getUserProfile, router, pathname]);

  // Menü açıkken body scroll'u kapat
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isVendor = userProfile?.role === "vendor_owner";
  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";

  return (
    <>
      {/* Top Bar - E-posta */}
      <div className="hidden border-b border-slate-100 bg-slate-50 md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4">
          <p className="text-xs text-slate-500">
            Türkiye&apos;nin catering platformu
          </p>
          <a
            href="mailto:info@cateringle.com"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-emerald-600"
          >
            <svg
              className="h-3.5 w-3.5"
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
            info@cateringle.com
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-slate-900">
                Cater<span className="text-emerald-600">ingle</span>
              </span>
              <span className="hidden text-[10px] leading-tight text-slate-400 sm:block">
                Catering Platformu
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {/* Kategoriler Dropdown */}
            <div ref={categoriesRef} className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  categoriesOpen
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Kategoriler
                <svg
                  className={`h-4 w-4 transition-transform ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Mega Menu */}
              {categoriesOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Etkinlik Türleri
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/vendors?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-emerald-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <svg
                            className="h-4 w-4 text-slate-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {cat.name}
                          </p>
                          <p className="text-xs text-slate-500">{cat.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <Link
                      href="/vendors"
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                    >
                      Tüm Firmaları Gör
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
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/vendors"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Firmalar
            </Link>
            <Link
              href="/blog"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Blog
            </Link>
            <Link
              href="/hakkimizda"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              İletişim
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
              </div>
            ) : userProfile ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/panel"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50"
                  >
                    Admin Panel
                  </Link>
                )}

                {isVendor && (
                  <Link
                    href="/vendor"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                  >
                    Firma Paneli
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Hesabım
                </Link>

                <form action="/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    Çıkış
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
                >
                  Ücretsiz Kayıt
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Menüyü aç"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <span className="text-sm font-bold text-white">C</span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Cater<span className="text-emerald-600">ingle</span>
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <svg
                  className="h-6 w-6"
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
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              {/* Kategoriler Section */}
              <div className="mb-4">
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Kategoriler
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/vendors?category=${cat.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="my-4 border-t border-slate-100" />

              {/* Main Links */}
              <div className="space-y-1">
                <Link
                  href="/vendors"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Tüm Firmalar
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
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
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  Blog
                </Link>
                <Link
                  href="/hakkimizda"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Hakkımızda
                </Link>
                <Link
                  href="/iletisim"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  İletişim
                </Link>
              </div>

              <div className="my-4 border-t border-slate-100" />

              {/* User Section */}
              {loading ? (
                <div className="space-y-2">
                  <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                </div>
              ) : userProfile ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      href="/panel"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50"
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
                      Admin Panel
                    </Link>
                  )}

                  {isVendor && (
                    <Link
                      href="/vendor"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Firma Paneli
                    </Link>
                  )}

                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                  >
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Hesabım
                  </Link>

                  <form action="/auth/logout" method="POST" className="mt-2">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Çıkış Yap
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    Ücretsiz Kayıt Ol
                  </Link>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-medium text-slate-500">
                  Bize Ulaşın
                </p>
                <a
                  href="mailto:info@cateringle.com"
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@cateringle.com
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
