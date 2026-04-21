"use client";

import { useRouter } from "next/navigation";
import { addWeeks, subWeeks, format, addDays, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00
const DAY_NAMES = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 border-yellow-300 text-yellow-800",
  CONFIRMED: "bg-indigo-100 border-indigo-300 text-indigo-800",
  COMPLETED: "bg-green-100 border-green-300 text-green-700",
};

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  guestName: string;
  guestPhone: string | null;
  serviceName: string;
  pricePln: number;
}

interface Props {
  bookings: Booking[];
  weekStart: string;
}

const HOUR_PX = 60;

function timeToMinutes(iso: string) {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function WeekCalendar({ bookings, weekStart }: Props) {
  const router = useRouter();
  const start = parseISO(weekStart);

  function navigate(delta: number) {
    const newDate = delta > 0 ? addWeeks(start, 1) : subWeeks(start, 1);
    router.push(`/dashboard/calendar?week=${format(newDate, "yyyy-MM-dd")}`);
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kalendarz</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-40 text-center">
            {format(start, "d MMM", { locale: pl })} – {format(addDays(start, 6), "d MMM yyyy", { locale: pl })}
          </span>
          <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(`/dashboard/calendar?week=${format(new Date(), "yyyy-MM-dd")}`)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600 transition-colors"
          >
            Dziś
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-gray-100">
            <div />
            {days.map((day, i) => {
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={i} className="py-3 text-center border-l border-gray-100 first:border-l-0">
                  <p className="text-xs text-slate-400">{DAY_NAMES[i]}</p>
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
              <div key={hour} className="grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: HOUR_PX }}>
                <div className="flex items-start justify-end pr-2 pt-0.5">
                  <span className="text-[10px] text-slate-300">{hour}:00</span>
                </div>
                {days.map((_, di) => (
                  <div key={di} className="border-l border-t border-gray-50" />
                ))}
              </div>
            ))}

            {/* Booking blocks */}
            {bookings.map((b) => {
              const startMin = timeToMinutes(b.startTime);
              const endMin = timeToMinutes(b.endTime);
              const dayIdx = parseISO(b.startTime).getDay();
              const dow = (dayIdx + 6) % 7; // Mon=0

              const top = ((startMin - 7 * 60) / 60) * HOUR_PX;
              const height = Math.max(((endMin - startMin) / 60) * HOUR_PX - 2, 20);

              if (top < 0 || top > HOURS.length * HOUR_PX) return null;

              const colWidth = `calc((100% - 48px) / 7)`;
              const left = `calc(48px + ${dow} * (100% - 48px) / 7 + 2px)`;

              return (
                <div
                  key={b.id}
                  style={{ position: "absolute", top: top + 1, left, width: `calc(${colWidth} - 4px)`, height }}
                  className={`rounded-lg border text-[11px] px-1.5 py-1 overflow-hidden cursor-default select-none ${STATUS_COLORS[b.status] ?? "bg-gray-100"}`}
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
      <div className="flex gap-4 mt-4 text-xs text-slate-500">
        {Object.entries({ PENDING: "Oczekuje", CONFIRMED: "Potwierdzone", COMPLETED: "Zakończone" }).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${STATUS_COLORS[k]}`} />
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}
