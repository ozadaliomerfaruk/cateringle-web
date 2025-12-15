// src/components/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Bell, Check } from "@phosphor-icons/react";
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

interface NotificationsData {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserSupabaseClient();

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: result, error } = await supabase.rpc(
        "get_user_notifications",
        {
          p_user_id: user.id,
          p_limit: 10,
          p_offset: 0,
          p_unread_only: false,
        }
      );

      if (error) {
        console.error("Load notifications error:", error);
        return;
      }

      setData(result as unknown as NotificationsData);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tümünü okundu yap
  const markAllRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc("mark_notifications_read", {
        p_user_id: user.id,
        p_notification_ids: null, // null = tümü
      });

      if (error) {
        console.error("Mark read error:", error);
        return;
      }

      // State güncelle
      setData((prev) =>
        prev
          ? {
              ...prev,
              unread_count: 0,
              notifications: prev.notifications.map((n) => ({
                ...n,
                is_read: true,
              })),
            }
          : null
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // Tek bildirimi okundu yap
  const markAsRead = async (notificationId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc("mark_notifications_read", {
        p_user_id: user.id,
        p_notification_ids: [notificationId],
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              unread_count: Math.max(0, prev.unread_count - 1),
              notifications: prev.notifications.map((n) =>
                n.id === notificationId ? { ...n, is_read: true } : n
              ),
            }
          : null
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadNotifications();

    // Her 30 saniyede bir yenile
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dropdown dışına tıklama
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Yeni bildirim geldi
            const newNotification = payload.new as Notification;
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    unread_count: prev.unread_count + 1,
                    total_count: prev.total_count + 1,
                    notifications: [newNotification, ...prev.notifications].slice(
                      0,
                      10
                    ),
                  }
                : null
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;

    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
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

  if (loading) {
    return (
      <div className="relative p-2">
        <Bell size={22} weight="regular" className="text-slate-400" />
      </div>
    );
  }

  const unreadCount = data?.unread_count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={22} weight={unreadCount > 0 ? "fill" : "regular"} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-leaf-600 hover:text-leaf-700"
              >
                <Check size={14} weight="bold" />
                Tümünü Okundu Yap
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {!data?.notifications || data.notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell
                  size={40}
                  weight="light"
                  className="mx-auto text-slate-300"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Henüz bildiriminiz yok
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.action_url || "#"}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`block px-4 py-3 transition-colors hover:bg-slate-50 ${
                      !notification.is_read ? "bg-leaf-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <span className="text-xl">
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.is_read
                              ? "font-semibold text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.is_read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-leaf-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {data?.total_count && data.total_count > 10 && (
            <div className="border-t border-slate-100 px-4 py-3">
              <Link
                href="/account/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-medium text-leaf-600 hover:text-leaf-700"
              >
                Tüm Bildirimleri Gör
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
