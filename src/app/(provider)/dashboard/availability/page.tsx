"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

interface Rule { dayOfWeek: number; startTime: string; endTime: string; }

export default function AvailabilityPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/provider/availability")
      .then((r) => r.json())
      .then((data: Rule[]) => {
        setRules(data);
        setLoading(false);
      });
  }, []);

  function isEnabled(dow: number) {
    return rules.some((r) => r.dayOfWeek === dow);
  }

  function getRule(dow: number): Rule {
    return rules.find((r) => r.dayOfWeek === dow) ?? { dayOfWeek: dow, startTime: "09:00", endTime: "17:00" };
  }

  function toggle(dow: number) {
    if (isEnabled(dow)) {
      setRules((r) => r.filter((x) => x.dayOfWeek !== dow));
    } else {
      setRules((r) => [...r, { dayOfWeek: dow, startTime: "09:00", endTime: "17:00" }]);
    }
  }

  function setTime(dow: number, field: "startTime" | "endTime", value: string) {
    setRules((r) =>
      r.map((x) => (x.dayOfWeek === dow ? { ...x, [field]: value } : x))
    );
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
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Godziny pracy</h1>
        <p className="text-sm text-slate-500 mt-1">Zaznacz dni i godziny, w których przyjmujesz rezerwacje.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {DAYS.map((label, dow) => {
          const enabled = isEnabled(dow);
          const rule = getRule(dow);
          return (
            <div key={dow} className={`flex items-center gap-4 px-5 py-4 ${enabled ? "" : "opacity-50"}`}>
              <button
                onClick={() => toggle(dow)}
                className={`w-10 h-6 rounded-full transition-colors shrink-0 relative ${enabled ? "bg-indigo-600" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4.5 left-0.5" : "left-0.5"}`} />
              </button>

              <span className="text-sm font-medium text-slate-700 w-28 shrink-0">{label}</span>

              {enabled ? (
                <div className="flex items-center gap-2 ml-auto">
                  <Input
                    type="time"
                    value={rule.startTime}
                    onChange={(e) => setTime(dow, "startTime", e.target.value)}
                    className="w-28 text-sm"
                  />
                  <span className="text-slate-400 text-sm">–</span>
                  <Input
                    type="time"
                    value={rule.endTime}
                    onChange={(e) => setTime(dow, "endTime", e.target.value)}
                    className="w-28 text-sm"
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm text-slate-400">Niedostępny</span>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-6 bg-slate-900 hover:bg-slate-800">
        {saving ? "Zapisywanie..." : "Zapisz godziny pracy"}
      </Button>
    </div>
  );
}
