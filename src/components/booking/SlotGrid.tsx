"use client";

interface Slot {
  time: string;
  available: boolean;
}

interface Props {
  slots: Slot[];
  selected: string | null;
  onSelect: (time: string) => void;
}

export function SlotGrid({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        Brak dostępnych terminów w tym dniu.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map(({ time, available }) =>
        available ? (
          <button
            key={time}
            onClick={() => onSelect(time)}
            className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
              selected === time
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-200 text-slate-700 hover:border-indigo-500"
            }`}
          >
            {time}
          </button>
        ) : (
          <div
            key={time}
            className="py-2 text-sm text-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed"
          >
            {time}
          </div>
        )
      )}
    </div>
  );
}
