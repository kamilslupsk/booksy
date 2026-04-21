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
  const dow = (date.getDay() + 6) % 7;
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
    fetch(`/api/providers/${providerSlug}/slots?date=${format(selectedDate, "yyyy-MM-dd")}&serviceId=${serviceId}`)
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
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-50 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-50 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-[10px] font-medium text-slate-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 text-sm mb-4">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;

          const isPast = isBefore(startOfDay(date), today);
          const isVacation = isVacationDay(date, vacationBlocks);
          const hasRule = hasAvailabilityRule(date, availabilityRules);
          const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isDisabled = isPast || isVacation || !hasRule;

          if (isDisabled) {
            return (
              <div
                key={date.toISOString()}
                title={isVacation ? "Przerwa urlopowa" : !hasRule ? "Brak dostępności" : "Miniona data"}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs text-gray-300 ${isVacation ? "line-through" : ""}`}
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white"
                  : "text-slate-800 hover:bg-indigo-50 hover:text-indigo-600"
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
          <div className="flex items-center justify-between mb-2 border-t border-gray-100 pt-3">
            <span className="text-xs font-semibold text-slate-700">
              {format(selectedDate, "d MMMM", { locale: pl })}
            </span>
            <span className="text-xs text-slate-400">{serviceDurationMin} min</span>
          </div>
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <SlotGrid slots={slots} selected={selectedSlot} onSelect={onSlotSelect} />
          )}
        </>
      )}
    </div>
  );
}
