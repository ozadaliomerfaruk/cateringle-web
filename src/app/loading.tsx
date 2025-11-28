// src/app/loading.tsx
import {
  HeroSkeleton,
  VendorCardSkeleton,
  Skeleton,
} from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero Skeleton */}
      <HeroSkeleton />

      {/* Kategoriler Skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="mx-auto mt-2 h-5 w-48" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                <Skeleton className="mx-auto mt-4 h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Skeleton */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-6 w-32 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-8 w-80" />
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
                <Skeleton className="mx-auto mt-4 h-6 w-32" />
                <Skeleton className="mx-auto mt-2 h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan Firmalar Skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto mt-2 h-5 w-64" />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <VendorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
