"use client";

import type { Service } from "@prisma/client";
import { Clock } from "lucide-react";

interface Props {
  services: Service[];
  selected: Service | null;
  onSelect: (service: Service) => void;
}

function groupByCategory(services: Service[]) {
  const map = new Map<string, Service[]>();
  for (const s of services) {
    const key = s.category ?? "Pozostałe";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

export function ServiceSelector({ services, selected, onSelect }: Props) {
  const grouped = groupByCategory(services);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {items.map((service) => {
              const isSelected = selected?.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => onSelect(service)}
                  className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-gray-100 bg-white hover:border-indigo-200"
                  }`}
                >
                  <div>
                    <p className={`font-medium ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                      {service.name}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {service.durationMin} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-slate-900">
                      {Number(service.pricePln)} zł
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "border-indigo-600" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
