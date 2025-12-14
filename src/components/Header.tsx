// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Buildings, Confetti, ForkKnife, Article } from "@phosphor-icons/react";
import NotificationBell from "./NotificationBell";

type UserRole = "customer" | "vendor_owner" | "admin" | "super_admin";

interface UserProfile {
  email: string;
  role: UserRole;
  full_name?: string;
}

interface HeaderProps {
  initialUser?: UserProfile | null;
}

// Navigasyon sekmeleri
const navTabs = [
  {
    name: "Kurumsal",
    href: "/vendors?segment=kurumsal",
    Icon: Buildings,
    segment: "kurumsal",
  },
  {
    name: "Bireysel",
    href: "/vendors?segment=bireysel",
    Icon: Confetti,
    segment: "bireysel",
  },
  {
    name: "Tüm Firmalar",
    href: "/vendors",
    Icon: ForkKnife,
    segment: null,
    exactPath: "/vendors",
  },
  { name: "Blog", href: "/blog", Icon: Article, pathPrefix: "/blog" },
];

export default function Header({ initialUser = null }: HeaderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    initialUser
  );
  const [loading, setLoading] = useState(!initialUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Sliding indicator state
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createBrowserSupabaseClient();

  // Aktif sekmeyi belirle
  const isTabActive = useCallback(
    (tab: (typeof navTabs)[0]) => {
      const currentSegment = searchParams.get("segment");

      if (tab.pathPrefix) {
        return pathname?.startsWith(tab.pathPrefix);
      }
      if (tab.exactPath) {
        return pathname === tab.exactPath && !currentSegment;
      }
      if (tab.segment) {
        return currentSegment === tab.segment;
      }
      return false;
    },
    [pathname, searchParams]
  );

  // Aktif tab index'ini bul
  const activeTabIndex = navTabs.findIndex((tab) => isTabActive(tab));

  // Slider pozisyonunu güncelle
  useEffect(() => {
    const updateSlider = () => {
      if (
        activeTabIndex >= 0 &&
        tabRefs.current[activeTabIndex] &&
        navContainerRef.current
      ) {
        const tabElement = tabRefs.current[activeTabIndex];
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const tabRect = tabElement!.getBoundingClientRect();

        setSliderStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      } else {
        setSliderStyle({ left: 0, width: 0 });
      }
    };

    // Initial ve her route değişikliğinde güncelle
    updateSlider();

    // Resize durumunda da güncelle
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [activeTabIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
        }

        setUserProfile({
          email: user.email || "",
          role: (profile?.role as UserRole) || "customer",
          full_name: profile?.full_name || undefined,
        });
      } catch (err) {
        console.error("Error in getUserProfile:", err);
        setUserProfile({
          email: user.email || "",
          role: "customer",
        });
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (initialUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (!isMounted) return;
        await getUserProfile(user);
      } catch (err) {
        console.error("Error in initAuth:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
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
  }, [supabase, getUserProfile, router, initialUser]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isVendor = userProfile?.role === "vendor_owner";
  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Ana Header */}
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Sol: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-600 shadow-sm">
                <span className="text-base font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-slate-900">
                Cater<span className="text-leaf-600">ingle</span>
              </span>
            </Link>

            {/* Orta: Navigasyon Tabs (Desktop) */}
            <nav className="hidden lg:flex">
              <div
                ref={navContainerRef}
                className="relative flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/50 p-1"
              >
                {/* Sliding Indicator */}
                <div
                  className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
                  style={{
                    left: sliderStyle.left || 4,
                    width: sliderStyle.width || 0,
                    opacity: sliderStyle.width > 0 ? 1 : 0,
                  }}
                />

                {navTabs.map((tab, index) => {
                  const isActive = isTabActive(tab);

                  return (
                    <Link
                      key={tab.name}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      href={tab.href}
                      className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <tab.Icon size={20} weight="light" />
                      {tab.name}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Sağ: User Menu */}
            <div className="flex items-center gap-3">
              {/* Tedarikçi Ol (Giriş yapmamışsa) */}
              {!loading && !userProfile && (
                <Link
                  href="/auth/register"
                  className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 lg:block"
                >
                  Tedarikçi Ol
                </Link>
              )}

              {/* Bildirimler (Giriş yapmışsa) */}
              {!loading && userProfile && <NotificationBell />}

              {/* User Menu Button */}
              <div ref={userMenuRef} className="relative">
                {loading ? (
                  <div className="h-10 w-20 animate-pulse rounded-full bg-slate-100" />
                ) : userProfile ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-md"
                  >
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-leaf-500 to-leaf-600 text-sm font-semibold text-white">
                      {userProfile.full_name?.charAt(0).toUpperCase() ||
                        userProfile.email.charAt(0).toUpperCase()}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-md"
                  >
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                    {userProfile ? (
                      <>
                        {/* Kullanıcı Bilgisi */}
                        <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                          <p className="font-medium text-slate-900">
                            {userProfile.full_name || "Kullanıcı"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {userProfile.email}
                          </p>
                        </div>

                        {/* Admin/Vendor Linkleri */}
                        {(isAdmin || isVendor) && (
                          <div className="border-b border-slate-100 py-2">
                            {isAdmin && (
                              <Link
                                href="/panel"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50"
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
                                    strokeWidth={1.5}
                                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
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
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-leaf-600 hover:bg-leaf-50"
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
                                    strokeWidth={1.5}
                                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                  />
                                </svg>
                                Firma Paneli
                              </Link>
                            )}
                          </div>
                        )}

                        {/* Genel Linkler */}
                        <div className="py-2">
                          <Link
                            href="/account/favorites"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
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
                                strokeWidth={1.5}
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                              />
                            </svg>
                            Favorilerim
                          </Link>
                          <Link
                            href="/account/quotes"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
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
                                strokeWidth={1.5}
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                              />
                            </svg>
                            Tekliflerim
                          </Link>
                          <Link
                            href="/account/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
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
                                strokeWidth={1.5}
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                              />
                            </svg>
                            Profil
                          </Link>
                        </div>

                        {/* Çıkış */}
                        <div className="border-t border-slate-100 pt-2">
                          <form action="/auth/logout" method="POST">
                            <button
                              type="submit"
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
                                  strokeWidth={1.5}
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                />
                              </svg>
                              Çıkış Yap
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Tedarikçi Ol
                        </Link>
                        <div className="my-2 border-t border-slate-100" />
                        <Link
                          href="/hakkimizda"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Hakkımızda
                        </Link>
                        <Link
                          href="/iletisim"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          İletişim
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobil Navigasyon Tabs */}
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {navTabs.map((tab) => {
              const isActive = isTabActive(tab);

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-leaf-100 text-leaf-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <tab.Icon size={18} weight="light" />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
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
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
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
              {loading ? (
                <div className="space-y-2">
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : userProfile ? (
                <>
                  {/* Kullanıcı Bilgisi */}
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-leaf-500 to-leaf-600 text-lg font-semibold text-white">
                      {userProfile.full_name?.charAt(0).toUpperCase() ||
                        userProfile.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {userProfile.full_name || "Kullanıcı"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {isAdmin && (
                      <Link
                        href="/panel"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50"
                      >
                        <span className="text-lg">⚙️</span>
                        Admin Panel
                      </Link>
                    )}
                    {isVendor && (
                      <Link
                        href="/vendor"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-leaf-600 hover:bg-leaf-50"
                      >
                        <span className="text-lg">🏪</span>
                        Firma Paneli
                      </Link>
                    )}
                    <Link
                      href="/account/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="text-lg">❤️</span>
                      Favorilerim
                    </Link>
                    <Link
                      href="/account/quotes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="text-lg">📋</span>
                      Tekliflerim
                    </Link>
                    <Link
                      href="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="text-lg">👤</span>
                      Profil
                    </Link>
                  </div>

                  <div className="my-4 border-t border-slate-200" />

                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <span className="text-lg">🚪</span>
                      Çıkış Yap
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl bg-leaf-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-leaf-700"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Tedarikçi Ol
                  </Link>

                  <div className="my-4 border-t border-slate-200" />

                  <Link
                    href="/hakkimizda"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Hakkımızda
                  </Link>
                  <Link
                    href="/iletisim"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    İletişim
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
