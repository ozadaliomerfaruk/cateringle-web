"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const defaultSettings = [
  { key: "site_name", label: "Site Adı", description: "Sitenin görünen adı" },
  {
    key: "site_description",
    label: "Site Açıklaması",
    description: "SEO için meta description",
  },
  {
    key: "contact_email",
    label: "İletişim E-posta",
    description: "Genel iletişim e-postası",
  },
  {
    key: "contact_phone",
    label: "İletişim Telefon",
    description: "Genel iletişim telefonu",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "WhatsApp iletişim numarası",
  },
  { key: "address", label: "Adres", description: "Şirket adresi" },
  {
    key: "facebook_url",
    label: "Facebook",
    description: "Facebook sayfa linki",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    description: "Instagram hesap linki",
  },
  { key: "twitter_url", label: "Twitter", description: "Twitter hesap linki" },
  {
    key: "linkedin_url",
    label: "LinkedIn",
    description: "LinkedIn sayfa linki",
  },
  { key: "youtube_url", label: "YouTube", description: "YouTube kanal linki" },
  {
    key: "google_analytics",
    label: "Google Analytics ID",
    description: "GA tracking ID (G-XXXXX)",
  },
  {
    key: "meta_keywords",
    label: "Meta Keywords",
    description: "SEO için anahtar kelimeler",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("site_settings" as never)
          .select("*");

        if (error) {
          console.error("site_settings table may not exist:", error);
          if (isMounted) {
            setTableExists(false);
            setLoading(false);
          }
          return;
        }

        const settingsMap: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[])?.forEach((s: { key: string; value: string | null }) => {
          settingsMap[s.key] = s.value || "";
        });

        if (isMounted) {
          setSettings(settingsMap);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        if (isMounted) {
          setTableExists(false);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSave() {
    if (!tableExists) {
      setMessage(
        "site_settings tablosu bulunamadı. Lütfen migration'ı çalıştırın."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      for (const setting of defaultSettings) {
        const value = settings[setting.key] || null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from("site_settings")
          .select("id")
          .eq("key", setting.key)
          .maybeSingle();

        if (existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("site_settings")
            .update({ value, description: setting.description })
            .eq("key", setting.key);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("site_settings").insert({
            key: setting.key,
            value,
            description: setting.description,
          });
        }
      }
      setMessage("Ayarlar kaydedildi!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Hata oluştu!");
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
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

  if (!tableExists) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="text-lg font-semibold text-yellow-800">
            Tablo Bulunamadı
          </h2>
          <p className="mt-2 text-sm text-yellow-700">
            <code>site_settings</code> tablosu henüz oluşturulmamış. Lütfen{" "}
            <code>supabase/migrations/20241201_create_site_settings.sql</code>{" "}
            dosyasını Supabase Dashboard&apos;ta çalıştırın.
          </p>
          <pre className="mt-4 overflow-x-auto rounded bg-slate-800 p-4 text-xs text-white">
            {`CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Ayarları</h1>
          <p className="text-sm text-slate-500">Genel site konfigürasyonu</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.includes("Hata")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Genel</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {defaultSettings.slice(0, 2).map((setting) => (
              <div key={setting.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {setting.label}
                </label>
                <input
                  type="text"
                  value={settings[setting.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [setting.key]: e.target.value })
                  }
                  placeholder={setting.description}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            İletişim Bilgileri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {defaultSettings.slice(2, 6).map((setting) => (
              <div key={setting.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {setting.label}
                </label>
                <input
                  type="text"
                  value={settings[setting.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [setting.key]: e.target.value })
                  }
                  placeholder={setting.description}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Sosyal Medya
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {defaultSettings.slice(6, 11).map((setting) => (
              <div key={setting.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {setting.label}
                </label>
                <input
                  type="text"
                  value={settings[setting.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [setting.key]: e.target.value })
                  }
                  placeholder={setting.description}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {defaultSettings.slice(11).map((setting) => (
              <div key={setting.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {setting.label}
                </label>
                <input
                  type="text"
                  value={settings[setting.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [setting.key]: e.target.value })
                  }
                  placeholder={setting.description}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
