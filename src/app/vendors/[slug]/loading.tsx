// src/app/vendors/[slug]/loading.tsx
import { VendorDetailSkeleton } from "@/components/Skeleton";

export default function VendorDetailLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <VendorDetailSkeleton />
    </main>
  );
}
