"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Settings {
  displayName: string;
  slug: string;
  bio: string;
  address: string;
  city: string;
  phone: string;
  category: string;
  slotStepMin: number;
  vacationBlocks: { id?: string; startDate: string; endDate: string; reason: string }[];
}

const EMPTY_VAC = { startDate: "", endDate: "", reason: "" };

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    displayName: "", slug: "", bio: "", address: "", city: "",
    phone: "", category: "", slotStepMin: 30, vacationBlocks: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/provider/settings")
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false); });
  }, []);

  function set(field: keyof Settings, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addVacation() {
    set("vacationBlocks", [...form.vacationBlocks, { ...EMPTY_VAC }]);
  }

  function removeVacation(i: number) {
    set("vacationBlocks", form.vacationBlocks.filter((_, idx) => idx !== i));
  }

  function updateVacation(i: number, field: string, value: string) {
    const updated = form.vacationBlocks.map((v, idx) => idx === i ? { ...v, [field]: value } : v);
    set("vacationBlocks", updated);
  }

  async function handleSave() {
    if (!form.displayName.trim()) { toast.error("Podaj nazwę"); return; }
    if (!form.slug.trim()) { toast.error("Podaj slug"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/provider/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Błąd zapisu"); return; }
      toast.success("Ustawienia zapisane");
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Ustawienia profilu</h1>
        <p className="text-sm text-slate-500 mt-1">Edytuj dane widoczne na Twojej stronie rezerwacji.</p>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Dane podstawowe</h2>
          <div>
            <Label>Nazwa / imię</Label>
            <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Adres URL Twojego profilu</Label>
            <div className="flex items-center mt-1.5">
              <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-slate-400">rezerwuj.pl/</span>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="rounded-l-none"
              />
            </div>
          </div>
          <div>
            <Label>Kategoria</Label>
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1.5" placeholder="np. Fryzjer" />
          </div>
          <div>
            <Label>Opis (bio)</Label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              placeholder="Kilka słów o sobie i swojej pracy..."
              className="mt-1.5 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Kontakt i lokalizacja</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" placeholder="+48 000 000 000" />
            </div>
            <div>
              <Label>Miasto</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" placeholder="np. Warszawa" />
            </div>
          </div>
          <div>
            <Label>Adres</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1.5" placeholder="ul. Przykładowa 1" />
          </div>
        </section>

        {/* Booking settings */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Ustawienia rezerwacji</h2>
          <div>
            <Label>Krok slotu (minuty)</Label>
            <select
              value={form.slotStepMin}
              onChange={(e) => set("slotStepMin", Number(e.target.value))}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[15, 30, 60].map((v) => <option key={v} value={v}>{v} minut</option>)}
            </select>
          </div>
        </section>

        {/* Vacation moved to calendar */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-700 flex items-center gap-3">
          <span>Urlopy i przerwy zarządzasz teraz bezpośrednio w</span>
          <a href="/dashboard/calendar" className="font-semibold underline underline-offset-2 hover:text-orange-900">Kalendarzu →</a>
        </section>

        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 w-full md:w-auto">
          {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
        </Button>
      </div>
    </div>
  );
}
