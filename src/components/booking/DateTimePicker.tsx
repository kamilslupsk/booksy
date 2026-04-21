"use client";

import { useState, useEffect } from "react";
import { format, isBefore, startOfDay, isWithinInterval } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SlotGrid } from "./SlotGrid";
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

const DAY_NAMES = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTH_NAMES = [
  "Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
  "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień",
];

function isVacationDay(date: Date, blocks: VacationBlock[]): boolean {
  return blocks.some((b) =>
    isWithinInterval(startOfDay(date), {
      start: startOfDay(new Date(b.startDate)),
      end: startOfDay(new Date(b.endDate)),
    })
  );
}

function hasAvailabilityRule(date: Date, rules: AvailabilityRule[]): boolean {
  const dow = (date.getDay() + 6) % 7; // 0=Mon
  return rules.some((r) => r.dayOfWeek === dow);
}

export function DateTimePicker({
  providerSlug, serviceId, serviceDurationMin,
  selectedDate, selectedSlot, vacationBlocks, availabilityRules,
  onDateSelect, onSlotSelect,
}: Props) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/providers/${providerSlug}/slots?date=${dateStr}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, providerSlug, serviceId]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">2</span>
        Wybierz termin
      </h2>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-50 text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-50 text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
        {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-sm mb-6">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const isPast = isBefore(startOfDay(date), today);
          const isVacation = isVacationDay(date, vacationBlocks);
          const hasRule = hasAvailabilityRule(date, availabilityRules);
          const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isDisabled = isPast || isVacation || !hasRule;

          if (isDisabled) {
            return (
              <div
                key={date.toISOString()}
                title={isVacation ? "Przerwa urlopowa" : isPast ? "Miniona data" : "Brak dostępności"}
                className={`aspect-square flex items-center justify-center rounded-full text-gray-300 ${isVacation ? "bg-orange-50 line-through" : ""}`}
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`aspect-square flex items-center justify-center rounded-full font-medium transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-900 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <>
          <hr className="border-gray-100 mb-4" />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {format(selectedDate, "d MMMM", { locale: pl })}
            </h3>
            <span className="text-xs text-slate-400">{serviceDurationMin} min</span>
          </div>
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <SlotGrid slots={slots} selected={selectedSlot} onSelect={onSlotSelect} />
          )}
        </>
      )}
    </div>
  );
}
