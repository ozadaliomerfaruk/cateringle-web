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

const corporateCategories = [
  { name: "Ofis Öğle Yemekleri", slug: "ofis-ogle-yemekleri", icon: "🍽️" },
  { name: "Toplantı İkramları", slug: "toplanti-ikramlari", icon: "☕" },
  { name: "Ofis Kahvaltısı", slug: "ofis-kahvaltisi", icon: "🥐" },
  { name: "Kurumsal Etkinlik", slug: "kurumsal-etkinlik", icon: "🎪" },
  { name: "Konferans & Seminer", slug: "konferans-seminer", icon: "🎤" },
  { name: "Fuar & Organizasyon", slug: "fuar-organizasyon", icon: "🏢" },
];

const individualCategories = [
  { name: "Düğün & Nişan", slug: "dugun-nisan", icon: "💒" },
  { name: "Doğum Günü", slug: "dogum-gunu", icon: "🎂" },
  { name: "Evde Şef Hizmeti", slug: "evde-sef-hizmeti", icon: "👨‍🍳" },
  { name: "Pasta & Tatlı", slug: "pasta-tatli", icon: "🧁" },
  { name: "Baby Shower & Mevlüt", slug: "baby-shower-mevlut", icon: "👶" },
  { name: "Ev Partisi", slug: "ev-partisi", icon: "🏠" },
];

export default function Header() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [corporateOpen, setCorporateOpen] = useState(false);
  const [individualOpen, setIndividualOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const corporateRef = useRef<HTMLDivElement>(null);
  const individualRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        corporateRef.current &&
        !corporateRef.current.contains(event.target as Node)
      ) {
        setCorporateOpen(false);
      }
      if (
        individualRef.current &&
        !individualRef.current.contains(event.target as Node)
      ) {
        setIndividualOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isVendor = userProfile?.role === "vendor_owner";
  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";

  const closeAllDropdowns = () => {
    setCorporateOpen(false);
    setIndividualOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-leaf-500">
                <span className="text-sm font-bold text-white">C</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                Cater<span className="text-leaf-600">ingle</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {/* Kurumsal Dropdown */}
              <div ref={corporateRef} className="relative">
                <button
                  onClick={() => {
                    setCorporateOpen(!corporateOpen);
                    setIndividualOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    corporateOpen
                      ? "text-leaf-600"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Kurumsal
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      corporateOpen ? "rotate-180" : ""
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
                {corporateOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-64 border border-slate-200 bg-white py-2 shadow-lg">
                    <div className="mb-2 border-b border-slate-100 px-4 pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Kurumsal Hizmetler
                      </span>
                    </div>
                    {corporateCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/vendors?segment=kurumsal&category=${cat.slug}`}
                        onClick={closeAllDropdowns}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="text-base">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <Link
                        href="/vendors?segment=kurumsal"
                        onClick={closeAllDropdowns}
                        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-leaf-600 hover:bg-leaf-50"
                      >
                        Tümünü Gör
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Bireysel Dropdown */}
              <div ref={individualRef} className="relative">
                <button
                  onClick={() => {
                    setIndividualOpen(!individualOpen);
                    setCorporateOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    individualOpen
                      ? "text-leaf-600"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Bireysel
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      individualOpen ? "rotate-180" : ""
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
                {individualOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-64 border border-slate-200 bg-white py-2 shadow-lg">
                    <div className="mb-2 border-b border-slate-100 px-4 pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Bireysel Hizmetler
                      </span>
                    </div>
                    {individualCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/vendors?segment=bireysel&category=${cat.slug}`}
                        onClick={closeAllDropdowns}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="text-base">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <Link
                        href="/vendors?segment=bireysel"
                        onClick={closeAllDropdowns}
                        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-leaf-600 hover:bg-leaf-50"
                      >
                        Tümünü Gör
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/vendors"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Tüm Firmalar
              </Link>
            </nav>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              {loading ? (
                <div className="h-9 w-24 animate-pulse bg-slate-100" />
              ) : userProfile ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex h-6 w-6 items-center justify-center bg-leaf-500 text-xs font-bold text-white">
                      {userProfile.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {userProfile.email}
                    </span>
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-slate-200 bg-white py-1 shadow-lg">
                      {isAdmin && (
                        <Link
                          href="/panel"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-grape-600 hover:bg-grape-50"
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
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-leaf-600 hover:bg-leaf-50"
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Firma Paneli
                        </Link>
                      )}
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                      <div className="my-1 border-t border-slate-100" />
                      <form action="/auth/logout" method="POST">
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Çıkış Yap
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    Tedarikçi Ol
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-leaf-500 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-600"
                  >
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center text-slate-700 lg:hidden"
            >
              {mobileMenuOpen ? (
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
              ) : (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav
            className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <span className="font-semibold text-slate-900">Menü</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kurumsal
                </p>
                <div className="space-y-1">
                  {corporateCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/vendors?segment=kurumsal&category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bireysel
                </p>
                <div className="space-y-1">
                  {individualCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/vendors?segment=bireysel&category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="my-4 border-t border-slate-200" />
              <Link
                href="/vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-leaf-600 hover:bg-leaf-50"
              >
                Tüm Firmalar
              </Link>
              <div className="my-4 border-t border-slate-200" />
              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 animate-pulse bg-slate-100" />
                  <div className="h-10 animate-pulse bg-slate-100" />
                </div>
              ) : userProfile ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      href="/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-grape-600 hover:bg-grape-50"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {isVendor && (
                    <Link
                      href="/vendor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-leaf-600 hover:bg-leaf-50"
                    >
                      Firma Paneli
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Hesabım
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Çıkış Yap
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block border border-leaf-500 px-4 py-2.5 text-center text-sm font-medium text-leaf-600 hover:bg-leaf-50"
                  >
                    Tedarikçi Ol
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-leaf-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-leaf-600"
                  >
                    Giriş Yap
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
