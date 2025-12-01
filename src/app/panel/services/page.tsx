"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ServiceGroup {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number | null;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  group_id: number;
  description?: string | null;
  sort_order: number | null;
}

export default function ServicesPage() {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"groups" | "services">("groups");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    group_id: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [{ data: groupsData }, { data: servicesData }] = await Promise.all([
        supabase.from("service_groups").select("*").order("sort_order"),
        supabase.from("services").select("*").order("sort_order"),
      ]);

      if (isMounted) {
        setGroups(groupsData || []);
        setServices(servicesData || []);
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

  async function handleAddGroup() {
    if (!formData.name.trim()) return;
    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    await supabase.from("service_groups").insert({
      name: formData.name,
      slug,
      description: formData.description || null,
      sort_order: groups.length + 1,
    });
    resetForm();
    refresh();
  }

  async function handleAddService() {
    if (!formData.name.trim() || !formData.group_id) return;
    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    await supabase.from("services").insert({
      name: formData.name,
      slug,
      group_id: formData.group_id,
      description: formData.description || null,
      sort_order: services.length + 1,
    });
    resetForm();
    refresh();
  }

  async function handleUpdateGroup(id: number) {
    await supabase
      .from("service_groups")
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      })
      .eq("id", id);
    setEditingId(null);
    refresh();
  }

  async function handleUpdateService(id: number) {
    await supabase
      .from("services")
      .update({
        name: formData.name,
        slug: formData.slug,
        group_id: formData.group_id,
        description: formData.description || null,
      })
      .eq("id", id);
    setEditingId(null);
    refresh();
  }

  async function handleDeleteGroup(id: number) {
    const groupServices = services.filter((s) => s.group_id === id);
    if (groupServices.length > 0) {
      alert("Bu gruba ait hizmetler var. Önce hizmetleri silin.");
      return;
    }
    if (!confirm("Bu grubu silmek istediğinize emin misiniz?")) return;
    await supabase.from("service_groups").delete().eq("id", id);
    refresh();
  }

  async function handleDeleteService(id: number) {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    await supabase.from("services").delete().eq("id", id);
    refresh();
  }

  function resetForm() {
    setFormData({ name: "", slug: "", description: "", group_id: 0 });
    setShowAddForm(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Hizmetler</h1>
          <p className="text-sm text-slate-500">
            {groups.length} grup, {services.length} hizmet
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          + Yeni Ekle
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("groups")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "groups"
              ? "bg-leaf-600 text-white"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          Gruplar ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "services"
              ? "bg-leaf-600 text-white"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          Hizmetler ({services.length})
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">
            {activeTab === "groups" ? "Yeni Grup" : "Yeni Hizmet"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Ad"
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
            {activeTab === "services" && (
              <select
                value={formData.group_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    group_id: parseInt(e.target.value),
                  })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value={0}>Grup Seçin</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
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
              onClick={
                activeTab === "groups" ? handleAddGroup : handleAddService
              }
              className="rounded-lg bg-leaf-600 px-4 py-2 text-sm text-white hover:bg-leaf-700"
            >
              Kaydet
            </button>
            <button
              onClick={resetForm}
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
                Ad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Slug
              </th>
              {activeTab === "services" && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  Grup
                </th>
              )}
              {activeTab === "groups" && (
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">
                  Hizmet Sayısı
                </th>
              )}
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activeTab === "groups"
              ? groups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50">
                    {editingId === group.id ? (
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
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleUpdateGroup(group.id)}
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
                          {group.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {group.slug}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-500">
                          {
                            services.filter((s) => s.group_id === group.id)
                              .length
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingId(group.id);
                              setFormData({
                                name: group.name,
                                slug: group.slug,
                                description: group.description || "",
                                group_id: 0,
                              });
                            }}
                            className="text-sm text-blue-600 hover:underline mr-3"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Sil
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              : services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    {editingId === service.id ? (
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
                            value={formData.group_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                group_id: parseInt(e.target.value),
                              })
                            }
                            className="w-full rounded border px-2 py-1 text-sm"
                          >
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleUpdateService(service.id)}
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
                          {service.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {service.slug}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {groups.find((g) => g.id === service.group_id)
                            ?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingId(service.id);
                              setFormData({
                                name: service.name,
                                slug: service.slug,
                                description: service.description || "",
                                group_id: service.group_id,
                              });
                            }}
                            className="text-sm text-blue-600 hover:underline mr-3"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
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
