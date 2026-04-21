"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addWeeks, subWeeks, format, addDays, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { QuickBookModal } from "./QuickBookModal";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const DAY_NAMES = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-100 border-yellow-300 text-yellow-800",
  CONFIRMED: "bg-indigo-100 border-indigo-300 text-indigo-800",
  COMPLETED: "bg-green-100 border-green-300 text-green-700",
};

interface Service { id: string; name: string; durationMin: number; pricePln: string; }
interface Booking {
  id: string; startTime: string; endTime: string; status: string;
  guestName: string; guestPhone: string | null; serviceName: string; pricePln: number;
}
interface Props { bookings: Booking[]; weekStart: string; services: Service[]; }

const HOUR_PX = 56;

function timeToMinutes(iso: string) {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function WeekCalendar({ bookings, weekStart, services }: Props) {
  const router = useRouter();
  const start = parseISO(weekStart);
  const [modal, setModal] = useState<{ date: string; time: string } | null>(null);

  function navigate(delta: number) {
    const newDate = delta > 0 ? addWeeks(start, 1) : subWeeks(start, 1);
    router.push(`/dashboard/calendar?week=${format(newDate, "yyyy-MM-dd")}`);
  }

  function handleCellClick(day: Date, hour: number) {
    setModal({
      date: format(day, "yyyy-MM-dd"),
      time: `${String(hour).padStart(2, "0")}:00`,
    });
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kalendarz</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-36 text-center">
            {format(start, "d MMM", { locale: pl })} – {format(addDays(start, 6), "d MMM yyyy", { locale: pl })}
          </span>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/dashboard/calendar?week=${format(new Date(), "yyyy-MM-dd")}`)}
            className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600 transition-colors"
          >
            Dziś
          </button>
          <button
            onClick={() => setModal({ date: format(new Date(), "yyyy-MM-dd"), time: "09:00" })}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Dodaj
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[580px]">
          {/* Day headers */}
          <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-gray-100">
            <div />
            {days.map((day, i) => {
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={i} className="py-2.5 text-center border-l border-gray-100">
                  <p className="text-[10px] text-slate-400 uppercase">{DAY_NAMES[i]}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${isToday ? "text-indigo-600" : "text-slate-700"}`}>
                    {format(day, "d")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[44px_repeat(7,1fr)]" style={{ height: HOUR_PX }}>
                <div className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-slate-300">{hour}:00</span>
                </div>
                {days.map((day, di) => (
                  <div
                    key={di}
                    className="border-l border-t border-gray-50 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                    onClick={() => handleCellClick(day, hour)}
                  >
                    <Plus className="w-3 h-3 text-indigo-300 opacity-0 group-hover:opacity-100 m-1 transition-opacity" />
                  </div>
                ))}
              </div>
            ))}

            {/* Booking blocks */}
            {bookings.map((b) => {
              const startMin = timeToMinutes(b.startTime);
              const endMin = timeToMinutes(b.endTime);
              const dayIdx = parseISO(b.startTime).getDay();
              const dow = (dayIdx + 6) % 7;
              const top = ((startMin - 7 * 60) / 60) * HOUR_PX;
              const height = Math.max(((endMin - startMin) / 60) * HOUR_PX - 2, 18);
              if (top < 0 || top > HOURS.length * HOUR_PX) return null;

              return (
                <div
                  key={b.id}
                  style={{
                    position: "absolute",
                    top: top + 1,
                    left: `calc(44px + ${dow} * (100% - 44px) / 7 + 2px)`,
                    width: `calc((100% - 44px) / 7 - 4px)`,
                    height,
                  }}
                  className={`rounded-md border text-[10px] px-1.5 py-0.5 overflow-hidden select-none ${STATUS_COLORS[b.status] ?? "bg-gray-100"}`}
                  title={`${b.serviceName} · ${b.guestName}${b.guestPhone ? ` · ${b.guestPhone}` : ""}`}
                >
                  <p className="font-semibold truncate leading-tight">{format(parseISO(b.startTime), "HH:mm")} {b.serviceName}</p>
                  <p className="truncate opacity-70">{b.guestName}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        {Object.entries({ PENDING: "Oczekuje", CONFIRMED: "Potwierdzone", COMPLETED: "Zakończone" }).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded border ${STATUS_COLORS[k]}`} />
            {v}
          </div>
        ))}
        <span className="ml-auto">Kliknij komórkę aby dodać wizytę</span>
      </div>

      {modal && (
        <QuickBookModal
          services={services}
          defaultDate={modal.date}
          defaultTime={modal.time}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
