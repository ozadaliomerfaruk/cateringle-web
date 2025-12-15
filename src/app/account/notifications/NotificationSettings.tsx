// src/app/account/notifications/NotificationSettings.tsx
"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Bell, Envelope, Gear, Check } from "@phosphor-icons/react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Preferences {
  lead_new_inapp: boolean;
  lead_new_email: boolean;
  quote_received_inapp: boolean;
  quote_received_email: boolean;
  quote_accepted_inapp: boolean;
  quote_accepted_email: boolean;
  quote_rejected_inapp: boolean;
  quote_rejected_email: boolean;
  message_new_inapp: boolean;
  message_new_email: boolean;
  review_new_inapp: boolean;
  review_new_email: boolean;
  booking_reminder_inapp: boolean;
  booking_reminder_email: boolean;
  system_inapp: boolean;
  system_email: boolean;
}

interface NotificationSettingsProps {
  userId: string;
  initialPreferences: Preferences | null;
  initialNotifications: Notification[];
  totalCount: number;
}

const NOTIFICATION_TYPES = [
  {
    key: "lead_new",
    label: "Yeni Talepler",
    description: "Yeni bir talep aldığınızda bildirim alın",
    icon: "📩",
  },
  {
    key: "quote_received",
    label: "Alınan Teklifler",
    description: "Yeni bir teklif aldığınızda bildirim alın",
    icon: "📋",
  },
  {
    key: "quote_accepted",
    label: "Kabul Edilen Teklifler",
    description: "Teklifiniz kabul edildiğinde bildirim alın",
    icon: "✅",
  },
  {
    key: "quote_rejected",
    label: "Reddedilen Teklifler",
    description: "Teklifiniz reddedildiğinde bildirim alın",
    icon: "❌",
  },
  {
    key: "message_new",
    label: "Yeni Mesajlar",
    description: "Yeni mesaj aldığınızda bildirim alın",
    icon: "💬",
  },
  {
    key: "review_new",
    label: "Yeni Yorumlar",
    description: "Yeni yorum yazıldığında bildirim alın",
    icon: "⭐",
  },
  {
    key: "booking_reminder",
    label: "Rezervasyon Hatırlatmaları",
    description: "Yaklaşan etkinlikler için hatırlatma alın",
    icon: "📅",
  },
  {
    key: "system",
    label: "Sistem Bildirimleri",
    description: "Önemli güncellemeler ve duyurular",
    icon: "📢",
  },
];

export default function NotificationSettings({
  userId,
  initialPreferences,
  initialNotifications,
  totalCount: _totalCount,
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "settings">("all");
  const [preferences, setPreferences] = useState<Preferences>(
    initialPreferences || {
      lead_new_inapp: true,
      lead_new_email: true,
      quote_received_inapp: true,
      quote_received_email: true,
      quote_accepted_inapp: true,
      quote_accepted_email: true,
      quote_rejected_inapp: true,
      quote_rejected_email: false,
      message_new_inapp: true,
      message_new_email: true,
      review_new_inapp: true,
      review_new_email: true,
      booking_reminder_inapp: true,
      booking_reminder_email: true,
      system_inapp: true,
      system_email: false,
    }
  );
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createBrowserSupabaseClient();

  // Tercih güncelle
  const updatePreference = async (key: keyof Preferences, value: boolean) => {
    setSaving(true);
    setMessage(null);

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ type: "success", text: "Kaydedildi" });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Update preference error:", error);
      setMessage({ type: "error", text: "Hata oluştu" });
      // Geri al
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  // Tümünü okundu yap
  const markAllRead = async () => {
    try {
      await supabase.rpc("mark_notifications_read", {
        p_user_id: userId,
        p_notification_ids: null,
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      lead_new: "📩",
      quote_received: "📋",
      quote_accepted: "✅",
      quote_rejected: "❌",
      message_new: "💬",
      review_new: "⭐",
      vendor_approved: "🎉",
      vendor_rejected: "😔",
      booking_reminder: "📅",
      system: "📢",
    };
    return icons[type] || "🔔";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-leaf-600 text-leaf-700"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell size={18} />
          Tüm Bildirimler
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "border-leaf-600 text-leaf-700"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Gear size={18} />
          Tercihler
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* All Notifications */}
        {activeTab === "all" && (
          <div>
            {/* Header */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-sm text-leaf-600 hover:text-leaf-700"
                >
                  <Check size={16} weight="bold" />
                  Tümünü Okundu Yap
                </button>
              </div>
            )}

            {/* List */}
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell
                  size={48}
                  weight="light"
                  className="mx-auto text-slate-300"
                />
                <p className="mt-2 text-slate-500">Henüz bildiriminiz yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.action_url || "#"}
                    className={`block py-4 transition-colors hover:bg-slate-50 ${
                      !notification.is_read ? "bg-leaf-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`${
                            !notification.is_read
                              ? "font-semibold text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="mt-1 text-sm text-slate-500">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-leaf-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Hangi bildirimler alacağınızı ve nasıl alacağınızı ayarlayın.
            </p>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                <div className="col-span-6">Bildirim Türü</div>
                <div className="col-span-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Bell size={16} />
                    Uygulama
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Envelope size={16} />
                    Email
                  </span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {NOTIFICATION_TYPES.map((type) => {
                  const inappKey = `${type.key}_inapp` as keyof Preferences;
                  const emailKey = `${type.key}_email` as keyof Preferences;

                  return (
                    <div
                      key={type.key}
                      className="grid grid-cols-12 items-center gap-4 px-4 py-4"
                    >
                      {/* Type Info */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <p className="font-medium text-slate-900">
                              {type.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* In-app Toggle */}
                      <div className="col-span-3 text-center">
                        <button
                          onClick={() =>
                            updatePreference(inappKey, !preferences[inappKey])
                          }
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences[inappKey]
                              ? "bg-leaf-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              preferences[inappKey]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Email Toggle */}
                      <div className="col-span-3 text-center">
                        <button
                          onClick={() =>
                            updatePreference(emailKey, !preferences[emailKey])
                          }
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences[emailKey]
                              ? "bg-leaf-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              preferences[emailKey]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
