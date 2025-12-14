// src/app/vendor/calendar/CalendarManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Calendar from "@/components/Calendar";
import {
  CalendarBlank,
  Clock,
  X,
  Plus,
  Check,
  Warning,
  Trash,
} from "@phosphor-icons/react";

interface Availability {
  id: string;
  vendor_id: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  max_events_per_day: number;
}

interface BlockedDate {
  id: string;
  vendor_id: string;
  blocked_date: string;
  reason: string | null;
  note: string | null;
}

interface Booking {
  id: string;
  vendor_id: string;
  lead_id: string | null;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  event_type: string | null;
  guest_count: number | null;
  customer_name: string;
  customer_phone: string | null;
  status: string;
}

interface CalendarManagerProps {
  vendorId: string;
  initialAvailability: Availability[];
  initialBlockedDates: BlockedDate[];
  initialBookings: Booking[];
}

const DAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

export default function CalendarManager({
  vendorId,
  initialAvailability,
  initialBlockedDates,
  initialBookings,
}: CalendarManagerProps) {
  const router = useRouter();
  const [availability, setAvailability] =
    useState<Availability[]>(initialAvailability);
  const [blockedDates, setBlockedDates] =
    useState<BlockedDate[]>(initialBlockedDates);
  const [bookings] = useState<Booking[]>(initialBookings);

  const [activeTab, setActiveTab] = useState<
    "calendar" | "weekly" | "blocked" | "bookings"
  >("calendar");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Bloke tarih ekleme modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("other");
  const [blockNote, setBlockNote] = useState("");

  const supabase = createBrowserSupabaseClient();

  // Haftalık müsaitlik güncelle
  const updateAvailability = async (
    dayOfWeek: number,
    field: string,
    value: unknown
  ) => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("vendor_availability")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("vendor_id", vendorId)
        .eq("day_of_week", dayOfWeek);

      if (error) throw error;

      setAvailability((prev) =>
        prev.map((a) =>
          a.day_of_week === dayOfWeek ? { ...a, [field]: value } : a
        )
      );

      setMessage({ type: "success", text: "Kaydedildi" });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage({ type: "error", text: "Hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  // Bloke tarih ekle
  const addBlockedDate = async () => {
    if (!blockDate) return;

    setSaving(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from("vendor_blocked_dates")
        .insert({
          vendor_id: vendorId,
          blocked_date: blockDate,
          reason: blockReason,
          note: blockNote || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedDates((prev) => [...prev, data]);
      setShowBlockModal(false);
      setBlockDate("");
      setBlockReason("other");
      setBlockNote("");
      setMessage({ type: "success", text: "Tarih bloke edildi" });
      router.refresh();
    } catch (error) {
      console.error("Block date error:", error);
      setMessage({ type: "error", text: "Hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  // Bloke tarih sil
  const removeBlockedDate = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("vendor_blocked_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Remove blocked date error:", error);
      setMessage({ type: "error", text: "Hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  // Takvim için availability data hazırla
  const calendarAvailability = bookings.map((b) => ({
    date: b.event_date,
    day_of_week: new Date(b.event_date).getDay(),
    is_working_day: true,
    is_blocked: blockedDates.some((d) => d.blocked_date === b.event_date),
    is_available: false,
    current_bookings: 1,
    max_events: 2,
  }));

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
        {[
          { id: "calendar", label: "Takvim", icon: CalendarBlank },
          { id: "weekly", label: "Haftalık Ayarlar", icon: Clock },
          { id: "blocked", label: "Bloke Tarihler", icon: X },
          { id: "bookings", label: "Rezervasyonlar", icon: Check },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-leaf-600 text-leaf-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Takvim Görünümü */}
        {activeTab === "calendar" && (
          <div className="mx-auto max-w-md">
            <Calendar
              availability={calendarAvailability}
              showLegend={true}
              onDateSelect={(date) => {
                setBlockDate(date);
                setShowBlockModal(true);
              }}
            />
            <p className="mt-4 text-center text-sm text-slate-500">
              Bir tarihe tıklayarak bloke edebilirsiniz
            </p>
          </div>
        )}

        {/* Haftalık Ayarlar */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Hangi günler çalıştığınızı ve çalışma saatlerinizi ayarlayın.
            </p>

            <div className="divide-y divide-slate-100">
              {DAYS.map((dayName, index) => {
                const dayAvail = availability.find(
                  (a) => a.day_of_week === index
                );
                const isAvailable = dayAvail?.is_available ?? true;

                return (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-4 py-4"
                  >
                    {/* Gün adı ve toggle */}
                    <div className="flex w-32 items-center gap-3">
                      <button
                        onClick={() =>
                          updateAvailability(
                            index,
                            "is_available",
                            !isAvailable
                          )
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          isAvailable ? "bg-leaf-500" : "bg-slate-300"
                        }`}
                        disabled={saving}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            isAvailable ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                      <span
                        className={`text-sm font-medium ${
                          isAvailable ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {dayName}
                      </span>
                    </div>

                    {/* Saat aralığı */}
                    {isAvailable && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dayAvail?.start_time?.slice(0, 5) || "09:00"}
                            onChange={(e) =>
                              updateAvailability(
                                index,
                                "start_time",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            disabled={saving}
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            value={dayAvail?.end_time?.slice(0, 5) || "22:00"}
                            onChange={(e) =>
                              updateAvailability(
                                index,
                                "end_time",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            disabled={saving}
                          />
                        </div>

                        {/* Max etkinlik */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">
                            Max etkinlik:
                          </span>
                          <select
                            value={dayAvail?.max_events_per_day || 2}
                            onChange={(e) =>
                              updateAvailability(
                                index,
                                "max_events_per_day",
                                parseInt(e.target.value)
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            disabled={saving}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bloke Tarihler */}
        {activeTab === "blocked" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Tatil, izin veya başka nedenlerle çalışmayacağınız tarihleri
                ekleyin.
              </p>
              <button
                onClick={() => setShowBlockModal(true)}
                className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
              >
                <Plus size={18} />
                Tarih Ekle
              </button>
            </div>

            {blockedDates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
                <CalendarBlank
                  size={48}
                  weight="light"
                  className="mx-auto text-slate-300"
                />
                <p className="mt-2 text-slate-500">
                  Henüz bloke tarih eklemediniz
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {blockedDates.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {new Date(blocked.blocked_date).toLocaleDateString(
                          "tr-TR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                      {blocked.note && (
                        <p className="text-sm text-slate-500">{blocked.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeBlockedDate(blocked.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      disabled={saving}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rezervasyonlar */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Onaylanmış rezervasyonlarınız
            </p>

            {bookings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
                <Check
                  size={48}
                  weight="light"
                  className="mx-auto text-slate-300"
                />
                <p className="mt-2 text-slate-500">
                  Henüz rezervasyonunuz yok
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {bookings.map((booking) => (
                  <div key={booking.id} className="px-4 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {booking.customer_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(booking.event_date).toLocaleDateString(
                            "tr-TR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                          {booking.event_start_time &&
                            ` · ${booking.event_start_time.slice(0, 5)}`}
                        </p>
                        {booking.guest_count && (
                          <p className="text-sm text-slate-500">
                            {booking.guest_count} kişi
                            {booking.event_type && ` · ${booking.event_type}`}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Onaylı
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bloke Tarih Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tarih Bloke Et</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tarih
                </label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sebep
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="holiday">Resmi Tatil</option>
                  <option value="vacation">İzin</option>
                  <option value="full">Dolu</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Not (opsiyonel)
                </label>
                <input
                  type="text"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                  placeholder="Örn: Bayram tatili"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  onClick={addBlockedDate}
                  disabled={!blockDate || saving}
                  className="flex-1 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Bloke Et"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
