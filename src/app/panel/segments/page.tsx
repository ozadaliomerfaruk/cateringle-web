"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface Segment {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const { data } = await supabase
        .from("customer_segments")
        .select("*")
        .order("sort_order", { ascending: true });

      if (isMounted) {
        setSegments(data || []);
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
    if (!formData.name.trim()) return;
    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    await supabase.from("customer_segments").insert({
      name: formData.name,
      slug,
      description: formData.description || null,
      is_active: true,
      sort_order: segments.length + 1,
    });
    setFormData({ name: "", slug: "", description: "" });
    setShowAddForm(false);
    refresh();
  }

  async function handleUpdate(id: number) {
    await supabase
      .from("customer_segments")
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      })
      .eq("id", id);
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu segmenti silmek istediğinize emin misiniz?")) return;
    await supabase.from("customer_segments").delete().eq("id", id);
    refresh();
  }

  async function toggleActive(id: number, currentState: boolean | null) {
    await supabase
      .from("customer_segments")
      .update({ is_active: !currentState })
      .eq("id", id);
    refresh();
  }

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
          <h1 className="text-2xl font-bold text-slate-900">
            Müşteri Segmentleri
          </h1>
          <p className="text-sm text-slate-500">
            {segments.length} segment (Kurumsal, Bireysel vb.)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          + Yeni Ekle
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Yeni Segment</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Segment Adı"
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
            <input
              type="text"
              placeholder="Açıklama (opsiyonel)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
                Segment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Açıklama
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">
                Durum
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {segments.map((segment) => (
              <tr key={segment.id} className="hover:bg-slate-50">
                {editingId === segment.id ? (
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
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUpdate(segment.id)}
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
                      {segment.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {segment.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {segment.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          toggleActive(segment.id, segment.is_active)
                        }
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          segment.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {segment.is_active ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingId(segment.id);
                          setFormData({
                            name: segment.name,
                            slug: segment.slug,
                            description: segment.description || "",
                          });
                        }}
                        className="text-sm text-blue-600 hover:underline mr-3"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(segment.id)}
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
