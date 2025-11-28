// src/app/account/favorites/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FavoriteButton from "../../../components/FavoriteButton";

export const dynamic = "force-dynamic";

// Supabase nested query için tip tanımı
type FavoriteWithVendor = {
  id: string;
  created_at: string | null;
  vendor: {
    id: string;
    business_name: string;
    slug: string;
    logo_url: string | null;
    avg_price_per_person: number | null;
    min_guest_count: number | null;
    max_guest_count: number | null;
    city: { name: string } | null;
  };
};

export default async function FavoritesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/favorites");
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      vendor:vendors (
        id,
        business_name,
        slug,
        logo_url,
        avg_price_per_person,
        min_guest_count,
        max_guest_count,
        city:cities(name)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedFavorites = favorites as FavoriteWithVendor[] | null;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Favorilerim</h1>
        <p className="text-sm text-slate-600">
          Beğendiğiniz catering firmalarını buradan takip edin.
        </p>
      </div>

      {!typedFavorites || typedFavorites.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="mt-3 text-slate-600">Henüz favori eklemediniz.</p>
          <Link
            href="/vendors"
            className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline"
          >
            Firmaları keşfedin
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {typedFavorites.map((fav) => (
            <div
              key={fav.id}
              className="relative rounded-lg border bg-white p-4 shadow-sm"
            >
              {/* Favori Butonu */}
              <div className="absolute right-2 top-2">
                <FavoriteButton vendorId={fav.vendor.id} size="sm" />
              </div>

              <Link href={`/vendors/${fav.vendor.slug}`} className="block">
                <div className="flex gap-3">
                  {/* Logo */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
                    {fav.vendor.logo_url ? (
                      <Image
                        src={fav.vendor.logo_url}
                        alt={fav.vendor.business_name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <svg
                        className="h-6 w-6 text-emerald-600"
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
                  {/* Bilgiler */}
                  <div className="flex-1 pr-8">
                    <h3 className="font-semibold hover:text-emerald-600">
                      {fav.vendor.business_name}
                    </h3>
                    {fav.vendor.city?.name && (
                      <p className="flex items-center gap-1 text-xs text-slate-500">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {fav.vendor.city.name}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {fav.vendor.avg_price_per_person && (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                          ≈ {Math.round(fav.vendor.avg_price_per_person)}{" "}
                          TL/kişi
                        </span>
                      )}
                      {fav.vendor.min_guest_count &&
                        fav.vendor.max_guest_count && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {fav.vendor.min_guest_count}-
                            {fav.vendor.max_guest_count} kişi
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
