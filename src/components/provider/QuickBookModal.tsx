"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Service { id: string; name: string; durationMin: number; pricePln: string; }

interface Props {
  services: Service[];
  defaultDate?: string;
  defaultTime?: string;
  onClose: () => void;
}

export function QuickBookModal({ services, defaultDate, defaultTime, onClose }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(defaultTime ?? "09:00");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!clientName.trim()) { toast.error("Podaj imię klienta"); return; }
    if (!serviceId) { toast.error("Wybierz usługę"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/provider/quick-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, serviceId, clientName, clientPhone, notes }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Błąd zapisu");
        return;
      }
      toast.success("Wizyta dodana");
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const TIMES = Array.from({ length: 28 }, (_, i) => {
    const h = Math.floor(i / 2) + 7;
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">Szybka rezerwacja</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Godzina</Label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Usługa</Label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs">Imię klienta *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 text-sm" placeholder="np. Jan Kowalski" />
          </div>

          <div>
            <Label className="text-xs">Telefon klienta</Label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="mt-1 text-sm" placeholder="+48 000 000 000" />
          </div>

          <div>
            <Label className="text-xs">Notatka</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 text-sm" placeholder="np. farbowanie + strzyżenie" />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-slate-900 hover:bg-slate-800">
            {saving ? "Zapisywanie..." : "Zapisz wizytę"}
          </Button>
          <Button variant="outline" onClick={onClose} className="px-4">Anuluj</Button>
        </div>
      </div>
    </div>
  );
}
