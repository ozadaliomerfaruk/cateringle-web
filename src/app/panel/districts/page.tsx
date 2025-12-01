"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  slug: string;
  city_id: number;
}

export default function DistrictsPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", city_id: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCity, setFilterCity] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [{ data: citiesData }, { data: districtsData }] = await Promise.all(
        [
          supabase.from("cities").select("id, name").order("name"),
          supabase.from("districts").select("*").order("name"),
        ]
      );

      if (isMounted) {
        setCities(citiesData || []);
        setDistricts(districtsData || []);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabase, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleAdd() {
    if (!formData.name.trim() || !formData.city_id) return;
    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    await supabase.from("districts").insert({
      name: formData.name,
      slug,
      city_id: formData.city_id,
    });
    setFormData({ name: "", slug: "", city_id: 0 });
    setShowAddForm(false);
    refresh();
  }

  async function handleUpdate(id: number) {
    await supabase
      .from("districts")
      .update({
        name: formData.name,
        slug: formData.slug,
        city_id: formData.city_id,
      })
      .eq("id", id);
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu ilçeyi silmek istediğinize emin misiniz?")) return;
    await supabase.from("districts").delete().eq("id", id);
    refresh();
  }

  const filteredDistricts = filterCity
    ? districts.filter((d) => d.city_id === filterCity)
    : districts;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İlçeler</h1>
          <p className="text-sm text-slate-500">{districts.length} ilçe</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          + Yeni Ekle
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filterCity || ""}
          onChange={(e) =>
            setFilterCity(e.target.value ? parseInt(e.target.value) : null)
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tüm Şehirler</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Yeni İlçe</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={formData.city_id}
              onChange={(e) =>
                setFormData({ ...formData, city_id: parseInt(e.target.value) })
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value={0}>Şehir Seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="İlçe Adı"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Slug (otomatik)"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-leaf-600 px-4 py-2 text-sm text-white hover:bg-leaf-700"
            >
              Kaydet
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                İlçe
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Şehir
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDistricts.map((district) => (
              <tr key={district.id} className="hover:bg-slate-50">
                {editingId === district.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={formData.city_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            city_id: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      >
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUpdate(district.id)}
                        className="text-sm text-leaf-600 hover:underline mr-2"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-slate-500 hover:underline"
                      >
                        İptal
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {district.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {district.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {cities.find((c) => c.id === district.city_id)?.name ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingId(district.id);
                          setFormData({
                            name: district.name,
                            slug: district.slug,
                            city_id: district.city_id,
                          });
                        }}
                        className="text-sm text-blue-600 hover:underline mr-3"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(district.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
