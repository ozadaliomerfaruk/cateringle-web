import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import MenuManager from "./MenuManager";

export const dynamic = "force-dynamic";

async function addCategory(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!vendor) return;

  await supabase.from("menu_categories").insert({
    vendor_id: vendor.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
  });

  revalidatePath("/vendor/menu");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const categoryId = formData.get("category_id") as string;

  await supabase.from("menu_categories").delete().eq("id", categoryId);
  revalidatePath("/vendor/menu");
}

async function addMenuItem(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!vendor) return;

  await supabase.from("menu_items").insert({
    vendor_id: vendor.id,
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price_per_person: formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : null,
    min_order_count: formData.get("min_order")
      ? parseInt(formData.get("min_order") as string)
      : null,
  });

  revalidatePath("/vendor/menu");
}

async function deleteMenuItem(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const itemId = formData.get("item_id") as string;

  await supabase.from("menu_items").delete().eq("id", itemId);
  revalidatePath("/vendor/menu");
}

async function addPackage(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!vendor) return;

  const includesRaw = formData.get("includes") as string;
  const includes = includesRaw
    ? includesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  await supabase.from("packages").insert({
    vendor_id: vendor.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price_per_person: parseFloat(formData.get("price") as string),
    min_guest_count: formData.get("min_guests")
      ? parseInt(formData.get("min_guests") as string)
      : null,
    max_guest_count: formData.get("max_guests")
      ? parseInt(formData.get("max_guests") as string)
      : null,
    includes,
  });

  revalidatePath("/vendor/menu");
}

async function deletePackage(formData: FormData) {
  "use server";
  const supabase = await createServerSupabaseClient();
  const packageId = formData.get("package_id") as string;

  await supabase.from("packages").delete().eq("id", packageId);
  revalidatePath("/vendor/menu");
}

export default async function VendorMenuPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/menu");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/vendor");
  }

  // Kategoriler ve menü öğeleri
  const { data: categories } = await supabase
    .from("menu_categories")
    .select(
      `
      id, name, description, sort_order,
      menu_items (id, name, description, price_per_person, min_order_count, is_active, sort_order)
    `
    )
    .eq("vendor_id", vendor.id)
    .order("sort_order");

  // Paketler
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("sort_order");

  return (
    <MenuManager
      categories={categories || []}
      packages={packages || []}
      actions={{
        addCategory,
        deleteCategory,
        addMenuItem,
        deleteMenuItem,
        addPackage,
        deletePackage,
      }}
    />
  );
}
