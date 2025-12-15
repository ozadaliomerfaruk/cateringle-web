// src/app/vendor/reviews/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import VendorReviewsClient from "./VendorReviewsClient";

export const metadata: Metadata = {
  title: "Yorumlar | Vendor Panel",
  description: "Müşteri yorumlarınızı yönetin",
};

export default async function VendorReviewsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/reviews");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  return <VendorReviewsClient vendorId={vendor.id} vendorName={vendor.business_name} />;
}
