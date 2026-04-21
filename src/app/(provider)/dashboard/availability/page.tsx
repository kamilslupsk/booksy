"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const PRESETS = [
  { label: "9–17", start: "09:00", end: "17:00" },
  { label: "10–18", start: "10:00", end: "18:00" },
  { label: "8–16", start: "08:00", end: "16:00" },
  { label: "12–20", start: "12:00", end: "20:00" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface Rule { dayOfWeek: number; startTime: string; endTime: string; }

export default function AvailabilityPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/provider/availability")
      .then((r) => r.json())
      .then((data: Rule[]) => { setRules(data); setLoading(false); });
  }, []);

  const isEnabled = (dow: number) => rules.some((r) => r.dayOfWeek === dow);
  const getRule = (dow: number): Rule =>
    rules.find((r) => r.dayOfWeek === dow) ?? { dayOfWeek: dow, startTime: "09:00", endTime: "17:00" };

  function toggle(dow: number) {
    if (isEnabled(dow)) {
      setRules((r) => r.filter((x) => x.dayOfWeek !== dow));
    } else {
      setRules((r) => [...r, { dayOfWeek: dow, startTime: "09:00", endTime: "17:00" }]);
    }
  }

  function setTime(dow: number, field: "startTime" | "endTime", value: string) {
    setRules((r) => r.map((x) => x.dayOfWeek === dow ? { ...x, [field]: value } : x));
  }

  function applyPreset(preset: typeof PRESETS[0]) {
    const enabled = rules.map((r) => r.dayOfWeek);
    if (enabled.length === 0) {
      setRules([0,1,2,3,4].map((d) => ({ dayOfWeek: d, startTime: preset.start, endTime: preset.end })));
    } else {
      setRules((r) => r.map((x) => ({ ...x, startTime: preset.start, endTime: preset.end })));
    }
    toast.success(`Ustawiono ${preset.label} dla wszystkich aktywnych dni`);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/provider/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (!res.ok) throw new Error();
      toast.success("Godziny pracy zapisane");
    } catch {
      toast.error("Coś poszło nie tak");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-slate-400">Ładowanie...</div>;

  return (
    <div className="p-6 md:p-10 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Godziny pracy</h1>
        <p className="text-sm text-slate-500 mt-1">Zaznacz dni kiedy przyjmujesz klientów.</p>
      </div>

      {/* Szybkie presety */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-2">Szybkie ustawienie dla wszystkich aktywnych dni:</p>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors bg-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {DAYS.map((label, dow) => {
          const enabled = isEnabled(dow);
          const rule = getRule(dow);
          return (
            <div key={dow} className="flex items-center gap-3 px-4 py-3">
              {/* Toggle */}
              <button
                onClick={() => toggle(dow)}
                className={`w-9 h-5 rounded-full transition-colors shrink-0 relative ${enabled ? "bg-indigo-600" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? "left-4" : "left-0.5"}`} />
              </button>

              <span className={`text-sm font-medium w-8 shrink-0 ${enabled ? "text-slate-800" : "text-slate-400"}`}>{label}</span>

              {enabled ? (
                <div className="flex items-center gap-1.5 ml-auto">
                  <select
                    value={rule.startTime}
                    onChange={(e) => setTime(dow, "startTime", e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-slate-400 text-xs">–</span>
                  <select
                    value={rule.endTime}
                    onChange={(e) => setTime(dow, "endTime", e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ) : (
                <span className="ml-auto text-xs text-slate-300">wolny</span>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-5 bg-slate-900 hover:bg-slate-800 w-full">
        {saving ? "Zapisywanie..." : "Zapisz"}
      </Button>
    </div>
  );
}
