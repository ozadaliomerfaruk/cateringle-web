import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import CategoryRow from "./CategoryRow";

interface Segment {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
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

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();

  // Segmentleri çek
  const { data: segments } = await supabase
    .from("customer_segments")
    .select("*")
    .order("sort_order");

  // Kategorileri çek
  const { data: categories } = await supabase
    .from("service_categories")
    .select("*, segment:customer_segments(name, slug)")
    .order("segment_id")
    .order("sort_order");

  // Kategori segment güncelleme
  async function updateCategorySegment(formData: FormData) {
    "use server";
    const supabase = await createServerSupabaseClient();

    const categoryId = formData.get("category_id") as string;
    const segmentId = formData.get("segment_id") as string;

    await supabase
      .from("service_categories")
      .update({ segment_id: segmentId ? parseInt(segmentId) : null })
      .eq("id", parseInt(categoryId));

    revalidatePath("/panel/categories");
  }

  // Kategori aktiflik güncelleme
  async function toggleCategoryActive(formData: FormData) {
    "use server";
    const supabase = await createServerSupabaseClient();

    const categoryId = formData.get("category_id") as string;
    const isActive = formData.get("is_active") === "true";

    await supabase
      .from("service_categories")
      .update({ is_active: !isActive })
      .eq("id", parseInt(categoryId));

    revalidatePath("/panel/categories");
  }

  // Segment aktiflik güncelleme
  async function toggleSegmentActive(formData: FormData) {
    "use server";
    const supabase = await createServerSupabaseClient();

    const segmentId = formData.get("segment_id") as string;
    const isActive = formData.get("is_active") === "true";

    await supabase
      .from("customer_segments")
      .update({ is_active: !isActive })
      .eq("id", parseInt(segmentId));

    revalidatePath("/panel/categories");
  }

  // Segment bazlı kategori grupla
  const categoriesBySegment: Record<string, Category[]> = {
    kurumsal: [],
    bireysel: [],
    segmentsiz: [],
  };

  (categories as Category[])?.forEach((cat) => {
    if (cat.segment?.slug === "kurumsal") {
      categoriesBySegment.kurumsal.push(cat);
    } else if (cat.segment?.slug === "bireysel") {
      categoriesBySegment.bireysel.push(cat);
    } else {
      categoriesBySegment.segmentsiz.push(cat);
    }
  });

  // Segments for CategoryRow (simplified)
  const segmentsForRow =
    (segments as Segment[])?.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
    })) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kategori Yönetimi</h1>
        <p className="mt-1 text-slate-500">
          Segmentleri ve kategorileri yönetin
        </p>
      </div>

      {/* Segmentler */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Segmentler
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(segments as Segment[])?.map((segment) => (
            <div
              key={segment.id}
              className={`rounded-xl border p-5 ${
                segment.slug === "kurumsal"
                  ? "border-blue-200 bg-blue-50"
                  : "border-leaf--200 bg-leaf-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {segment.slug === "kurumsal" ? "🏢" : "🎉"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {segment.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {segment.description}
                    </p>
                  </div>
                </div>
                <form action={toggleSegmentActive}>
                  <input type="hidden" name="segment_id" value={segment.id} />
                  <input
                    type="hidden"
                    name="is_active"
                    value={segment.is_active.toString()}
                  />
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      segment.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {segment.is_active ? "Aktif" : "Pasif"}
                  </button>
                </form>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-medium">
                  {segment.slug === "kurumsal"
                    ? categoriesBySegment.kurumsal.length
                    : categoriesBySegment.bireysel.length}
                </span>{" "}
                kategori
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kurumsal Kategoriler */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-lg">
            🏢
          </span>
          Kurumsal Kategoriler
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {categoriesBySegment.kurumsal.length}
          </span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriesBySegment.kurumsal.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  segments={segmentsForRow}
                  updateAction={updateCategorySegment}
                  toggleAction={toggleCategoryActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bireysel Kategoriler */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-100 text-lg">
            🎉
          </span>
          Bireysel Kategoriler
          <span className="ml-2 rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-medium text-leaf-700">
            {categoriesBySegment.bireysel.length}
          </span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriesBySegment.bireysel.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  segments={segmentsForRow}
                  updateAction={updateCategorySegment}
                  toggleAction={toggleCategoryActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segmentsiz Kategoriler */}
      {categoriesBySegment.segmentsiz.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg">
              ❓
            </span>
            Segmentsiz Kategoriler
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {categoriesBySegment.segmentsiz.length}
            </span>
          </h2>
          <p className="mb-4 text-sm text-amber-600">
            Bu kategoriler henüz bir segmente atanmamış. Lütfen segment seçin.
          </p>
          <div className="overflow-hidden rounded-xl border border-amber-200 bg-white">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Segment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriesBySegment.segmentsiz.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    segments={segmentsForRow}
                    updateAction={updateCategorySegment}
                    toggleAction={toggleCategoryActive}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
