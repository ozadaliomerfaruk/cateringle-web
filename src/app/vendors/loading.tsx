// src/app/vendors/loading.tsx
import {
  VendorListSkeleton,
  FilterSidebarSkeleton,
  CategoryPillsSkeleton,
} from "@/components/Skeleton";

export default function VendorsLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
              <div className="mt-1 h-5 w-32 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>

          {/* Kategori Pills */}
          <div className="mt-6">
            <CategoryPillsSkeleton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
              <FilterSidebarSkeleton />
            </div>
          </aside>

          {/* Vendor Grid */}
          <div className="flex-1">
            <VendorListSkeleton count={6} />
          </div>
        </div>
      </div>
    </main>
  );
}
