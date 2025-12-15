// src/app/panel/categories/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface Segment {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  segment_id: number | null;
  is_active: boolean;
  sort_order: number | null;
  segment?: { name: string; slug: string } | null;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Kategori ekle
async function addCategory(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const segmentId = formData.get("segment_id") as string;
  const icon = formData.get("icon") as string;

  if (!name) return;

  const slug = slugify(name);

  await supabaseAdmin.from("service_categories").insert({
    name,
    slug,
    icon: icon || null,
    segment_id: segmentId ? parseInt(segmentId) : null,
    is_active: true,
  });

  revalidatePath("/panel/categories");
}

// Kategori guncelle
async function updateCategory(formData: FormData) {
  "use server";

  const categoryId = formData.get("category_id") as string;
  const name = formData.get("name") as string;
  const segmentId = formData.get("segment_id") as string;
  const icon = formData.get("icon") as string;

  if (!categoryId) return;

  const updates: Record<string, unknown> = {};

  if (name) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (icon !== undefined) updates.icon = icon || null;

  // segment_id: "" = Her Ikisi (null), diger = segment id
  updates.segment_id = segmentId ? parseInt(segmentId) : null;

  await supabaseAdmin
    .from("service_categories")
    .update(updates)
    .eq("id", parseInt(categoryId));

  revalidatePath("/panel/categories");
}

// Kategori sil
async function deleteCategory(formData: FormData) {
  "use server";

  const categoryId = formData.get("category_id") as string;
  if (!categoryId) return;

  await supabaseAdmin
    .from("service_categories")
    .delete()
    .eq("id", parseInt(categoryId));

  revalidatePath("/panel/categories");
}

// Aktif/Pasif toggle
async function toggleCategoryActive(formData: FormData) {
  "use server";

  const categoryId = formData.get("category_id") as string;
  const isActive = formData.get("is_active") === "true";

  if (!categoryId) return;

  await supabaseAdmin
    .from("service_categories")
    .update({ is_active: !isActive })
    .eq("id", parseInt(categoryId));

  revalidatePath("/panel/categories");
}

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();

  // Segmentleri cek
  const { data: segments } = await supabase
    .from("customer_segments")
    .select("id, name, slug")
    .order("sort_order");

  // Kategorileri cek
  const { data: categories } = await supabase
    .from("service_categories")
    .select("*, segment:customer_segments(name, slug)")
    .order("sort_order")
    .order("name");

  const typedSegments = (segments || []) as Segment[];
  const typedCategories = (categories || []) as Category[];

  // Istatistikler
  const activeCount = typedCategories.filter((c) => c.is_active).length;
  const kurumsalCount = typedCategories.filter(
    (c) => c.segment?.slug === "kurumsal"
  ).length;
  const bireyselCount = typedCategories.filter(
    (c) => c.segment?.slug === "bireysel"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Kategori Yonetimi
        </h1>
        <p className="text-sm text-slate-600">
          Kategorileri ekle, duzenle, sil veya aktif/pasif yap
        </p>
      </div>

      {/* Istatistikler */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">
            {typedCategories.length}
          </p>
          <p className="text-xs text-slate-500">Toplam</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-leaf-600">{activeCount}</p>
          <p className="text-xs text-slate-500">Aktif</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-blue-600">{kurumsalCount}</p>
          <p className="text-xs text-slate-500">Kurumsal</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-purple-600">{bireyselCount}</p>
          <p className="text-xs text-slate-500">Bireysel</p>
        </div>
      </div>

      {/* Kategori Ekle */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">Yeni Kategori Ekle</h2>
        <form action={addCategory} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Kategori Adi
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ornek: Dugun Yemekleri"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Ikon
            </label>
            <input
              type="text"
              name="icon"
              placeholder="Opsiyonel"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Segment
            </label>
            <select
              name="segment_id"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
            >
              <option value="">Her Ikisi</option>
              {typedSegments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Kategoriler Tablosu */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Kategori
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Slug
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Segment
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Durum
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Islemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {typedCategories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-base">{category.icon}</span>
                    )}
                    <span className="font-medium text-slate-900">
                      {category.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {category.slug}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={updateCategory}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="hidden"
                      name="category_id"
                      value={category.id}
                    />
                    <select
                      name="segment_id"
                      defaultValue={category.segment_id?.toString() || ""}
                      className="rounded border border-slate-200 px-2 py-1 text-xs focus:border-leaf-500 focus:outline-none"
                    >
                      <option value="">Her Ikisi</option>
                      {typedSegments.map((seg) => (
                        <option key={seg.id} value={seg.id}>
                          {seg.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
                    >
                      Kaydet
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleCategoryActive}>
                    <input
                      type="hidden"
                      name="category_id"
                      value={category.id}
                    />
                    <input
                      type="hidden"
                      name="is_active"
                      value={category.is_active.toString()}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        category.is_active
                          ? "bg-leaf-100 text-leaf-700 hover:bg-leaf-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {category.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteCategory}>
                    <input
                      type="hidden"
                      name="category_id"
                      value={category.id}
                    />
                    <button
                      type="submit"
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {typedCategories.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            Henuz kategori yok
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <strong>Not:</strong> &quot;Her Ikisi&quot; secilen kategoriler hem
        kurumsal hem bireysel musterilere gosterilir.
      </div>
    </div>
  );
}
