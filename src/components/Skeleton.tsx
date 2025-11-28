// src/components/Skeleton.tsx
"use client";

// Temel Skeleton bileşeni
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

// Vendor kartı skeleton'u
export function VendorCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="p-5">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location */}
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Description */}
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Badges */}
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>

        {/* Button */}
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Vendor listesi skeleton'u
export function VendorListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Vendor detay hero skeleton'u
export function VendorDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className="bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          {/* Breadcrumb */}
          <div className="mb-6 flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Logo */}
            <Skeleton className="h-24 w-24 rounded-2xl" />

            <div className="flex-1">
              {/* Title */}
              <Skeleton className="h-8 w-64" />

              {/* Location */}
              <div className="mt-2 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5" />
                  ))}
                </div>
                <Skeleton className="h-5 w-20" />
              </div>

              {/* Badges */}
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-11 w-24 rounded-xl" />
              <Skeleton className="h-11 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol kolon */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hakkında */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-32" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Galeri */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-24" />
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Sağ kolon */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-full" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <Skeleton className="mt-4 h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form skeleton'u
export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div>
        <Skeleton className="mb-1.5 h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="mb-1.5 h-4 w-20" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="mb-1.5 h-4 w-28" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

// Kategori pills skeleton'u
export function CategoryPillsSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

// Sidebar filter skeleton'u
export function FilterSidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Şehir */}
      <div>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-10 w-full rounded-lg" />
      </div>

      {/* İlçe */}
      <div>
        <Skeleton className="h-5 w-12" />
        <Skeleton className="mt-2 h-10 w-full rounded-lg" />
      </div>

      {/* Fiyat */}
      <div>
        <Skeleton className="h-5 w-24" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>

      {/* Kişi sayısı */}
      <div>
        <Skeleton className="h-5 w-20" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>

      {/* Hizmetler */}
      <div>
        <Skeleton className="h-5 w-28" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <div className="animate-pulse bg-gradient-to-br from-slate-200 to-slate-300 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Skeleton className="mx-auto h-12 w-3/4 rounded-lg bg-slate-300" />
        <Skeleton className="mx-auto mt-4 h-6 w-1/2 rounded-lg bg-slate-300" />

        {/* Search form skeleton */}
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white/50 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Review card skeleton
export function ReviewCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32" />
          <div className="mt-1 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
          </div>
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex gap-4 border-b bg-slate-50 px-4 py-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b px-4 py-4 last:border-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
