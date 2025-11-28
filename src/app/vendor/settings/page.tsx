import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import VendorSettingsForm from "./VendorSettingsForm";

export const metadata: Metadata = {
  title: "Firma Ayarları",
  description: "Firma bilgilerinizi düzenleyin",
};

// Tip tanımları
type Service = {
  id: number;
  name: string;
  slug: string;
  sort_order: number | null;
};

type ServiceGroup = {
  id: number;
  name: string;
  icon: string | null;
  services: Service[];
};

export default async function VendorSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/settings");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  // Şehirler
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  // İlçeler
  let districts: { id: number; name: string }[] = [];
  if (vendor.city_id) {
    const { data } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", vendor.city_id)
      .order("name");
    districts = data || [];
  }

  // Kategoriler
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("sort_order");

  // Vendor'ın kategorileri
  const { data: vendorCategories } = await supabase
    .from("vendor_categories")
    .select("category_id")
    .eq("vendor_id", vendor.id);

  const selectedCategoryIds =
    vendorCategories?.map((vc) => vc.category_id) || [];

  // Hizmet grupları
  const { data: serviceGroups } = await supabase
    .from("service_groups")
    .select(`id, name, icon, services (id, name, slug, sort_order)`)
    .order("sort_order");

  const typedServiceGroups = serviceGroups as ServiceGroup[] | null;

  const sortedServiceGroups =
    typedServiceGroups?.map((g) => ({
      ...g,
      services:
        g.services?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ||
        [],
    })) || [];

  // Vendor'ın hizmetleri
  const { data: vendorServices } = await supabase
    .from("vendor_services")
    .select("service_id")
    .eq("vendor_id", vendor.id);

  const selectedServiceIds = vendorServices?.map((vs) => vs.service_id) || [];

  // Galeri
  const { data: images } = await supabase
    .from("vendor_images")
    .select("id, image_url, sort_order")
    .eq("vendor_id", vendor.id)
    .order("sort_order");

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Firma Ayarları</h1>
          <p className="mt-1 text-slate-500">
            Firma bilgilerinizi ve profilinizi düzenleyin
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <VendorSettingsForm
          vendor={vendor}
          cities={cities || []}
          districts={districts}
          categories={categories || []}
          selectedCategoryIds={selectedCategoryIds}
          serviceGroups={sortedServiceGroups}
          selectedServiceIds={selectedServiceIds}
          images={images || []}
        />
      </div>
    </main>
  );
}
