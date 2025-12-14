// src/components/Calendar.tsx
"use client";

import { useState, useMemo } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface DayAvailability {
  date: string;
  day_of_week: number;
  is_working_day: boolean;
  is_blocked: boolean;
  is_available: boolean;
  current_bookings: number;
  max_events: number;
}

interface CalendarProps {
  availability?: DayAvailability[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  showLegend?: boolean;
  isLoading?: boolean;
}

const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export default function Calendar({
  availability = [],
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  showLegend = true,
  isLoading = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Availability map oluştur
  const availabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    availability.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [availability]);

  // Ayın günlerini hesapla
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const startingDay = firstDay.getDay(); // 0 = Pazar
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Önceki aydan boş günler
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Bu ayın günleri
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(currentMonth.year, currentMonth.month, day));
    }

    return days;
  }, [currentMonth]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayStatus = (date: Date) => {
    const dateStr = formatDateString(date);
    const dayInfo = availabilityMap.get(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedDate === dateStr;
    const isMinDateViolation = minDate && date < minDate;
    const isMaxDateViolation = maxDate && date > maxDate;

    if (isPast || isMinDateViolation || isMaxDateViolation) {
      return {
        status: "disabled",
        className: "text-slate-300 cursor-not-allowed",
        tooltip: isPast ? "Geçmiş tarih" : "Bu tarih seçilemez",
      };
    }

    if (dayInfo) {
      if (dayInfo.is_blocked) {
        return {
          status: "blocked",
          className: "bg-red-100 text-red-400 cursor-not-allowed",
          tooltip: "Bloke edilmiş",
        };
      }
      if (!dayInfo.is_working_day) {
        return {
          status: "closed",
          className: "bg-slate-100 text-slate-400 cursor-not-allowed",
          tooltip: "Kapalı",
        };
      }
      if (!dayInfo.is_available) {
        return {
          status: "full",
          className: "bg-amber-100 text-amber-600 cursor-not-allowed",
          tooltip: "Dolu",
        };
      }
      if (dayInfo.current_bookings > 0) {
        return {
          status: "partial",
          className: isSelected
            ? "bg-leaf-600 text-white"
            : "bg-amber-50 text-amber-700 hover:bg-leaf-100 cursor-pointer",
          tooltip: `${dayInfo.current_bookings}/${dayInfo.max_events} rezervasyon`,
        };
      }
    }

    return {
      status: "available",
      className: isSelected
        ? "bg-leaf-600 text-white"
        : isToday
        ? "bg-leaf-50 text-leaf-700 ring-2 ring-leaf-500 hover:bg-leaf-100 cursor-pointer"
        : "hover:bg-leaf-50 cursor-pointer",
      tooltip: "Müsait",
    };
  };

  const handleDateClick = (date: Date) => {
    const status = getDayStatus(date);
    if (
      status.status === "disabled" ||
      status.status === "blocked" ||
      status.status === "closed" ||
      status.status === "full"
    ) {
      return;
    }
    onDateSelect?.(formatDateString(date));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="rounded-full p-2 hover:bg-slate-100"
          aria-label="Önceki ay"
        >
          <CaretLeft size={20} weight="bold" className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {MONTHS[currentMonth.month]} {currentMonth.year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="rounded-full p-2 hover:bg-slate-100"
          aria-label="Sonraki ay"
        >
          <CaretRight size={20} weight="bold" className="text-slate-600" />
        </button>
      </div>

      {/* Days Header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const { className, tooltip } = getDayStatus(date);

            return (
              <button
                key={formatDateString(date)}
                onClick={() => handleDateClick(date)}
                title={tooltip}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${className}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-leaf-500" />
            <span className="text-slate-600">Müsait</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-slate-600">Kısmi Dolu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="text-slate-600">Dolu/Bloke</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="text-slate-600">Kapalı</span>
          </div>
        </div>
      )}
    </div>
  );
}
