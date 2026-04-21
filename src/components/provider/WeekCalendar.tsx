"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addWeeks, subWeeks, format, addDays, parseISO, isWithinInterval, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Trash2, Palmtree } from "lucide-react";
import { QuickBookModal } from "./QuickBookModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
interface VacationBlock { id: string; startDate: string; endDate: string; reason: string; }
interface Props {
  bookings: Booking[];
  weekStart: string;
  services: Service[];
  vacationBlocks: VacationBlock[];
}

const HOUR_PX = 56;

function timeToMinutes(iso: string) {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function isDayOnVacation(day: Date, blocks: VacationBlock[]): VacationBlock | null {
  return blocks.find((b) =>
    isWithinInterval(startOfDay(day), {
      start: startOfDay(parseISO(b.startDate)),
      end: startOfDay(parseISO(b.endDate)),
    })
  ) ?? null;
}

export function WeekCalendar({ bookings, weekStart, services, vacationBlocks: initialBlocks }: Props) {
  const router = useRouter();
  const start = parseISO(weekStart);
  const [modal, setModal] = useState<{ date: string; time: string } | null>(null);
  const [vacations, setVacations] = useState<VacationBlock[]>(initialBlocks);
  const [showVacForm, setShowVacForm] = useState(false);
  const [vacForm, setVacForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [vacSaving, setVacSaving] = useState(false);

  function navigate(delta: number) {
    const newDate = delta > 0 ? addWeeks(start, 1) : subWeeks(start, 1);
    router.push(`/dashboard/calendar?week=${format(newDate, "yyyy-MM-dd")}`);
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  async function addVacation() {
    if (!vacForm.startDate || !vacForm.endDate) { toast.error("Podaj daty"); return; }
    setVacSaving(true);
    try {
      const res = await fetch("/api/provider/vacation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vacForm),
      });
      const data = await res.json();
      setVacations((v) => [...v, data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setVacForm({ startDate: "", endDate: "", reason: "" });
      setShowVacForm(false);
      toast.success("Urlop dodany");
      router.refresh();
    } finally {
      setVacSaving(false);
    }
  }

  async function deleteVacation(id: string) {
    await fetch("/api/provider/vacation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setVacations((v) => v.filter((x) => x.id !== id));
    toast.success("Urlop usunięty");
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kalendarz</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-36 text-center">
            {format(start, "d MMM", { locale: pl })} – {format(addDays(start, 6), "d MMM yyyy", { locale: pl })}
          </span>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => router.push(`/dashboard/calendar?week=${format(new Date(), "yyyy-MM-dd")}`)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600">
            Dziś
          </button>
          <button
            onClick={() => setModal({ date: format(new Date(), "yyyy-MM-dd"), time: "09:00" })}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Dodaj wizytę
          </button>
        </div>
      </div>

      {/* Vacation blocks manager */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-800">Urlopy i przerwy</span>
          </div>
          <button
            onClick={() => setShowVacForm((v) => !v)}
            className="text-xs text-orange-700 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Dodaj
          </button>
        </div>

        {showVacForm && (
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-3 items-end">
            <div>
              <label className="text-xs text-orange-700">Od</label>
              <Input type="date" value={vacForm.startDate} onChange={(e) => setVacForm((f) => ({ ...f, startDate: e.target.value }))} className="mt-1 text-sm h-8" />
            </div>
            <div>
              <label className="text-xs text-orange-700">Do</label>
              <Input type="date" value={vacForm.endDate} onChange={(e) => setVacForm((f) => ({ ...f, endDate: e.target.value }))} className="mt-1 text-sm h-8" />
            </div>
            <div>
              <label className="text-xs text-orange-700">Powód</label>
              <Input value={vacForm.reason} onChange={(e) => setVacForm((f) => ({ ...f, reason: e.target.value }))} placeholder="np. Urlop" className="mt-1 text-sm h-8" />
            </div>
            <Button onClick={addVacation} disabled={vacSaving} className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700 mb-0">
              Zapisz
            </Button>
          </div>
        )}

        {vacations.length === 0 ? (
          <p className="text-xs text-orange-600/70">Brak zaplanowanych urlopów.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vacations.map((v) => (
              <div key={v.id} className="flex items-center gap-1.5 bg-white border border-orange-200 rounded-lg px-2.5 py-1 text-xs text-orange-700">
                <span className="font-medium">{v.startDate} – {v.endDate}</span>
                {v.reason && <span className="text-orange-400">· {v.reason}</span>}
                <button onClick={() => deleteVacation(v.id)} className="ml-1 text-orange-300 hover:text-orange-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[580px]">
          {/* Day headers */}
          <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-gray-100">
            <div />
            {days.map((day, i) => {
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const vacation = isDayOnVacation(day, vacations);
              return (
                <div key={i} className={`py-2.5 text-center border-l border-gray-100 ${vacation ? "bg-orange-50" : ""}`}>
                  <p className="text-[10px] text-slate-400 uppercase">{DAY_NAMES[i]}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${isToday ? "text-indigo-600" : "text-slate-700"}`}>
                    {format(day, "d")}
                  </p>
                  {vacation && <p className="text-[9px] text-orange-500 mt-0.5 leading-tight">urlop</p>}
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
                {days.map((day, di) => {
                  const vacation = isDayOnVacation(day, vacations);
                  return (
                    <div
                      key={di}
                      className={`border-l border-t border-gray-50 transition-colors group ${
                        vacation
                          ? "bg-orange-50/60 cursor-not-allowed"
                          : "hover:bg-indigo-50/30 cursor-pointer"
                      }`}
                      onClick={() => !vacation && setModal({ date: format(day, "yyyy-MM-dd"), time: `${String(hour).padStart(2, "0")}:00` })}
                    >
                      {!vacation && <Plus className="w-3 h-3 text-indigo-300 opacity-0 group-hover:opacity-100 m-1 transition-opacity" />}
                    </div>
                  );
                })}
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
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
        {Object.entries({ PENDING: "Oczekuje", CONFIRMED: "Potwierdzone", COMPLETED: "Zakończone" }).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded border ${STATUS_COLORS[k]}`} />
            {v}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-orange-100 border border-orange-300" />
          Urlop
        </div>
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
