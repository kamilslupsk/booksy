"use client";

import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfDay, isBefore, isWithinInterval, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { VacationBlock, AvailabilityRule } from "@prisma/client";

interface Props {
  providerSlug: string;
  serviceId: string;
  serviceDurationMin: number;
  selectedDate: Date | null;
  selectedSlot: string | null;
  vacationBlocks: VacationBlock[];
  availabilityRules: AvailabilityRule[];
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: string) => void;
}

interface Slot { time: string; available: boolean; }

const MONTH_NAMES = [
  "Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
  "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień",
];

const PERIODS = [
  { key: "morning",   label: "Rano",       from: 0,  to: 12 },
  { key: "afternoon", label: "Popołudnie", from: 12, to: 18 },
  { key: "evening",   label: "Wieczór",    from: 18, to: 24 },
] as const;

function isVacationDay(date: Date, blocks: VacationBlock[]): boolean {
  return blocks.some((b) =>
    isWithinInterval(startOfDay(date), {
      start: startOfDay(new Date(b.startDate)),
      end: startOfDay(new Date(b.endDate)),
    })
  );
}

function hasAvailabilityRule(date: Date, rules: AvailabilityRule[]): boolean {
  const dow = (date.getDay() + 6) % 7;
  return rules.some((r) => r.dayOfWeek === dow);
}

export function DateTimePicker({
  providerSlug, serviceId, serviceDurationMin,
  selectedDate, selectedSlot, vacationBlocks, availabilityRules,
  onDateSelect, onSlotSelect,
}: Props) {
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState<Date>(selectedDate ? startOfDay(selectedDate) : today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("morning");
  const slotScrollRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const headerDate = selectedDate ?? days[0];

  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    fetch(`/api/providers/${providerSlug}/slots?date=${format(selectedDate, "yyyy-MM-dd")}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, providerSlug, serviceId]);

  function prevWeek() {
    const candidate = addDays(weekStart, -7);
    setWeekStart(isBefore(candidate, today) ? today : candidate);
  }
  function nextWeek() {
    setWeekStart(addDays(weekStart, 7));
  }

  // Filter slots by period
  const filteredSlots = slots.filter((s) => {
    const hour = Number(s.time.split(":")[0]);
    const p = PERIODS.find((p) => p.key === period)!;
    return hour >= p.from && hour < p.to;
  });

  function scrollSlots(dir: "left" | "right") {
    const el = slotScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="px-5 pt-5 pb-3 text-center border-b border-gray-100">
        <h3 className="text-base font-bold text-slate-900">
          {MONTH_NAMES[headerDate.getMonth()]} {headerDate.getFullYear()}
        </h3>
      </div>

      {/* Week strip */}
      <div className="flex items-center gap-1 px-2 py-4 border-b border-gray-100">
        <button
          onClick={prevWeek}
          disabled={isSameDay(weekStart, today)}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map((date) => {
            const isPast = isBefore(date, today);
            const isVacation = isVacationDay(date, vacationBlocks);
            const hasRule = hasAvailabilityRule(date, availabilityRules);
            const disabled = isPast || isVacation || !hasRule;
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

            return (
              <button
                key={date.toISOString()}
                onClick={() => !disabled && onDateSelect(date)}
                disabled={disabled}
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors relative ${
                  isSelected
                    ? "bg-teal-600 text-white"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-50 text-slate-900"
                }`}
              >
                <span className={`text-xs font-medium ${isSelected ? "text-white/90" : disabled ? "" : "text-slate-500"}`}>
                  {format(date, "EEE", { locale: pl })}
                </span>
                <span className="text-lg font-bold leading-none mt-0.5">
                  {date.getDate()}
                </span>
                {/* Availability indicator */}
                <span
                  className={`mt-1.5 h-1 w-6 rounded-full ${
                    isSelected
                      ? "bg-white/90"
                      : disabled
                      ? "bg-gray-200"
                      : "bg-green-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={nextWeek}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Period pills + slots */}
      {selectedDate && (
        <div className="p-5">
          {/* Period pills */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    period === p.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slots horizontal scroller */}
          {loadingSlots ? (
            <div className="flex gap-2 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              ))}
            </div>
          ) : filteredSlots.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-3">
              Brak wolnych terminów o tej porze
            </p>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollSlots("left")}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <div
                ref={slotScrollRef}
                className="flex-1 flex gap-1.5 overflow-x-auto scroll-smooth scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                {filteredSlots.map((s) => {
                  const isSelected = selectedSlot === s.time;
                  return (
                    <button
                      key={s.time}
                      onClick={() => s.available && onSlotSelect(s.time)}
                      disabled={!s.available}
                      className={`px-4 py-2 text-sm font-medium rounded-xl shrink-0 transition-colors ${
                        isSelected
                          ? "bg-teal-600 text-white"
                          : s.available
                          ? "bg-white border border-gray-200 text-slate-700 hover:border-teal-500 hover:text-teal-600"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollSlots("right")}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selection summary */}
      {selectedDate && selectedSlot && (
        <div className="mx-5 mb-5 bg-gray-50 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Wybrany termin</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {format(selectedDate, "EEEE, d MMMM", { locale: pl })} · {selectedSlot} · {serviceDurationMin} min
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
