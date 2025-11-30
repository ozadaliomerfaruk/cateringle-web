//
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Tables } from "@/types/database";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Cateringle.com hesap paneli",
};

type Vendor = Tables<"vendors">;
type City = Tables<"cities">;

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Favoriler
  const { count: favoriteCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Son favori firmalar
  const { data: recentFavorites } = await supabase
    .from("favorites")
    .select(
      "vendor:vendors(id, business_name, slug, logo_url, city:cities(name))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf--500 to-teal-600 text-3xl font-bold text-white shadow-lg">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || "Hesabım"}
              </h1>
              <p className="mt-1 text-slate-500">{user.email}</p>
              <p className="mt-1 text-sm text-slate-400">
                Üyelik:{" "}
                {new Date(user.created_at).toLocaleDateString("tr-TR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Hızlı Erişim */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Hızlı Erişim</h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/account/favorites"
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-leaf-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Favorilerim</p>
                    <p className="text-sm text-slate-500">
                      {favoriteCount || 0} firma
                    </p>
                  </div>
                </div>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="/account/profile"
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-leaf-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-5 w-5 text-blue-600"
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
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Profil Ayarları
                    </p>
                    <p className="text-sm text-slate-500">
                      Bilgilerinizi düzenleyin
                    </p>
                  </div>
                </div>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="/vendors"
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-leaf-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-100">
                    <svg
                      className="h-5 w-5 text-leaf-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Firma Ara</p>
                    <p className="text-sm text-slate-500">
                      Catering firmalarını keşfet
                    </p>
                  </div>
                </div>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Son Favoriler */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Son Favoriler</h2>
              {(favoriteCount || 0) > 3 && (
                <Link
                  href="/account/favorites"
                  className="text-sm font-medium text-leaf-600 hover:text-leaf-700"
                >
                  Tümünü gör
                </Link>
              )}
            </div>

            {recentFavorites && recentFavorites.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recentFavorites.map((fav) => {
                  const vendor = fav.vendor as unknown as
                    | (Vendor & { city: City | null })
                    | null;
                  if (!vendor) return null;

                  return (
                    <Link
                      key={vendor.id}
                      href={`/vendors/${vendor.slug}`}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-leaf-100">
                        {vendor.logo_url ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={vendor.logo_url}
                              alt={vendor.business_name ?? ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <svg
                            className="h-6 w-6 text-leaf-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {vendor.business_name}
                        </p>
                        {vendor.city?.name && (
                          <p className="text-sm text-slate-500">
                            {vendor.city.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-7 w-7 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Henüz favori eklemediniz
                </p>
                <Link
                  href="/vendors"
                  className="mt-3 text-sm font-medium text-leaf-600 hover:text-leaf-700"
                >
                  Firmaları keşfet →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
