// src/app/panel/filters/page.tsx
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type FilterType = "boolean" | "cuisine" | "delivery_model" | "tag";

interface PopularFilter {
  id: number;
  filter_type: FilterType;
  filter_key: string;
  label: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

// Filtre ekle
async function addFilter(formData: FormData) {
  "use server";

  const filter_type = formData.get("filter_type") as FilterType;
  const filter_key = formData.get("filter_key") as string;
  const label = formData.get("label") as string;
  const icon = formData.get("icon") as string;

  if (!filter_type || !filter_key || !label) return;

  await supabaseAdmin.from("popular_filters").insert({
    filter_type,
    filter_key,
    label,
    icon: icon || null,
    is_active: true,
    sort_order: 99,
  });

  revalidatePath("/panel/filters");
}

// Filtre guncelle
async function updateFilter(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const label = formData.get("label") as string;
  const icon = formData.get("icon") as string;
  const sort_order = formData.get("sort_order") as string;

  if (!id) return;

  await supabaseAdmin
    .from("popular_filters")
    .update({
      label,
      icon: icon || null,
      sort_order: parseInt(sort_order) || 0,
    })
    .eq("id", parseInt(id));

  revalidatePath("/panel/filters");
}

// Filtre sil
async function deleteFilter(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  if (!id) return;

  await supabaseAdmin.from("popular_filters").delete().eq("id", parseInt(id));

  revalidatePath("/panel/filters");
}

// Aktif/Pasif toggle
async function toggleFilter(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";

  if (!id) return;

  await supabaseAdmin
    .from("popular_filters")
    .update({ is_active: !is_active })
    .eq("id", parseInt(id));

  revalidatePath("/panel/filters");
}

export default async function FiltersPage() {
  const supabase = await createServerSupabaseClient();

  // Populer filtreleri cek
  const { data: filters, error } = await supabase
    .from("popular_filters")
    .select("*")
    .order("sort_order")
    .order("id");

  // Mutfak turlerini cek (dropdown icin)
  const { data: cuisines } = await supabase
    .from("cuisine_types")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  // Teslimat modellerini cek
  const { data: deliveryModels } = await supabase
    .from("delivery_models")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  // Etiketleri cek
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  const typedFilters = (filters || []) as PopularFilter[];
  const activeCount = typedFilters.filter((f) => f.is_active).length;

  // Boolean filtre secenekleri (vendors tablosundaki boolean kolonlar)
  const booleanOptions = [
    { key: "halal_certified", label: "Helal Sertifikali" },
    { key: "accepts_last_minute", label: "Son Dakika Siparis" },
    { key: "free_tasting", label: "Ucretsiz Tadim" },
    { key: "free_delivery", label: "Ucretsiz Teslimat" },
    { key: "available_24_7", label: "7/24 Hizmet" },
    { key: "has_refrigerated", label: "Frigorifik Arac" },
    { key: "serves_outside_city", label: "Sehir Disi Hizmet" },
  ];

  const filterTypeLabels: Record<FilterType, string> = {
    boolean: "Ozellik",
    cuisine: "Mutfak Turu",
    delivery_model: "Teslimat",
    tag: "Etiket",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Populer Filtreler
        </h1>
        <p className="text-sm text-slate-600">
          Firma arama sayfasinda gosterilecek populer filtreleri yonetin
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Hata: {error.message}
        </div>
      )}

      {/* Istatistikler */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">
            {typedFilters.length}
          </p>
          <p className="text-xs text-slate-500">Toplam Filtre</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-leaf-600">{activeCount}</p>
          <p className="text-xs text-slate-500">Aktif</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-2xl font-bold text-slate-400">
            {typedFilters.length - activeCount}
          </p>
          <p className="text-xs text-slate-500">Pasif</p>
        </div>
      </div>

      {/* Yeni Filtre Ekle */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">Yeni Filtre Ekle</h2>
        <form action={addFilter} className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Filtre Tipi
            </label>
            <select
              name="filter_type"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
            >
              <option value="boolean">Ozellik (Boolean)</option>
              <option value="cuisine">Mutfak Turu</option>
              <option value="delivery_model">Teslimat Modeli</option>
              <option value="tag">Etiket</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Filtre Anahtari
            </label>
            <select
              name="filter_key"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
            >
              <optgroup label="Ozellikler">
                {booleanOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
              {cuisines && cuisines.length > 0 && (
                <optgroup label="Mutfak Turleri">
                  {cuisines.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {deliveryModels && deliveryModels.length > 0 && (
                <optgroup label="Teslimat Modelleri">
                  {deliveryModels.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {tags && tags.length > 0 && (
                <optgroup label="Etiketler">
                  {tags.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Gorunen Isim
            </label>
            <input
              type="text"
              name="label"
              required
              placeholder="Ornek: Helal Sertifikali"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Ikon
            </label>
            <input
              type="text"
              name="icon"
              placeholder="Opsiyonel"
              maxLength={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Filtreler Tablosu */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Sira
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Filtre
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Tip
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Anahtar
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
            {typedFilters.map((filter) => (
              <tr
                key={filter.id}
                className={`hover:bg-slate-50 ${
                  !filter.is_active ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <form
                    action={updateFilter}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="id" value={filter.id} />
                    <input type="hidden" name="label" value={filter.label} />
                    <input
                      type="hidden"
                      name="icon"
                      value={filter.icon || ""}
                    />
                    <input
                      type="number"
                      name="sort_order"
                      defaultValue={filter.sort_order}
                      className="w-14 rounded border border-slate-200 px-2 py-1 text-xs text-center"
                    />
                    <button
                      type="submit"
                      className="rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-200"
                    >
                      Kaydet
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {filter.icon && (
                      <span className="text-base">{filter.icon}</span>
                    )}
                    <span className="font-medium text-slate-900">
                      {filter.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      filter.filter_type === "boolean"
                        ? "bg-blue-100 text-blue-700"
                        : filter.filter_type === "cuisine"
                        ? "bg-orange-100 text-orange-700"
                        : filter.filter_type === "delivery_model"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {filterTypeLabels[filter.filter_type]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {filter.filter_key}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleFilter}>
                    <input type="hidden" name="id" value={filter.id} />
                    <input
                      type="hidden"
                      name="is_active"
                      value={filter.is_active.toString()}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        filter.is_active
                          ? "bg-leaf-100 text-leaf-700 hover:bg-leaf-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {filter.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteFilter}>
                    <input type="hidden" name="id" value={filter.id} />
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
        {typedFilters.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            Henuz filtre eklenmemis
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <strong>Not:</strong> Aktif filtreler firma arama sayfasinda
        &quot;Populer Filtreler&quot; bolumunde gosterilir. Sira numarasi kucuk
        olan filtreler uste cikar.
      </div>
    </div>
  );
}
