"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategorySelectorProps {
  vendorId: string;
  initialSelectedIds: number[];
}

export default function CategorySelector({
  vendorId,
  initialSelectedIds,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, icon")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      if (data) setCategories(data);
    } catch (err) {
      console.error("Kategoriler yüklenemedi:", err);
      setStatus({ type: "error", message: "Kategoriler yüklenemedi" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggle = (categoryId: number) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const supabase = createBrowserSupabaseClient();

      // Önce mevcut kategorileri sil
      const { error: deleteError } = await supabase
        .from("vendor_categories")
        .delete()
        .eq("vendor_id", vendorId);

      if (deleteError) throw deleteError;

      // Yeni kategorileri ekle
      if (selectedIds.length > 0) {
        const inserts = selectedIds.map((categoryId) => ({
          vendor_id: vendorId,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabase
          .from("vendor_categories")
          .insert(inserts);

        if (insertError) throw insertError;
      }

      setStatus({ type: "success", message: "Kategoriler kaydedildi" });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      setStatus({
        type: "error",
        message: "Kaydetme başarısız. Tekrar deneyin.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            status.type === "success"
              ? "border border-leaf--200 bg-leaf-50 text-leaf-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleToggle(category.id)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-leaf--500 bg-leaf-50 ring-1 ring-leaf--500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">
                {category.name}
              </span>
              {isSelected && (
                <svg
                  className="h-5 w-5 text-leaf-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && (
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {saving ? "Kaydediliyor..." : "Kategorileri Kaydet"}
        </button>
        <span className="text-sm text-slate-500">
          {selectedIds.length} kategori seçili
        </span>
      </div>
    </div>
  );
}
