"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  category: string | null;
  durationMin: number;
  pricePln: string;
  isActive: boolean;
}

const EMPTY: Omit<Service, "id" | "isActive"> = { name: "", category: "", durationMin: 60, pricePln: "100" };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/provider/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Podaj nazwę usługi"); return; }
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { ...form, id: editing } : form;
      const res = await fetch("/api/provider/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Usługa zaktualizowana" : "Usługa dodana");
      setEditing(null);
      setAdding(false);
      setForm(EMPTY);
      load();
    } catch {
      toast.error("Coś poszło nie tak");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć tę usługę?")) return;
    await fetch("/api/provider/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Usługa usunięta");
    load();
  }

  async function toggleActive(service: Service) {
    await fetch("/api/provider/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
    });
    load();
  }

  function startEdit(s: Service) {
    setEditing(s.id);
    setAdding(false);
    setForm({ name: s.name, category: s.category ?? "", durationMin: s.durationMin, pricePln: String(s.pricePln) });
  }

  function cancel() { setEditing(null); setAdding(false); setForm(EMPTY); }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Usługi</h1>
          <p className="text-sm text-slate-500 mt-1">Zarządzaj ofertą swoich usług.</p>
        </div>
        {!adding && !editing && (
          <Button onClick={() => { setAdding(true); setForm(EMPTY); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1.5" /> Dodaj usługę
          </Button>
        )}
      </div>

      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">{editing ? "Edytuj usługę" : "Nowa usługa"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nazwa usługi</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="np. Strzyżenie damskie" className="mt-1.5" />
            </div>
            <div>
              <Label>Kategoria (opcjonalnie)</Label>
              <Input value={form.category ?? ""} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} placeholder="np. Włosy" className="mt-1.5" />
            </div>
            <div>
              <Label>Czas trwania (minuty)</Label>
              <Input type="number" min={15} step={15} value={form.durationMin} onChange={(e) => setForm(f => ({ ...f, durationMin: Number(e.target.value) }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Cena (zł)</Label>
              <Input type="number" min={0} step={1} value={form.pricePln} onChange={(e) => setForm(f => ({ ...f, pricePln: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
              <Check className="w-4 h-4 mr-1.5" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
            <Button variant="outline" onClick={cancel}>
              <X className="w-4 h-4 mr-1.5" /> Anuluj
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-16">Brak usług. Dodaj pierwszą usługę powyżej.</p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm transition-opacity ${s.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{s.name}</p>
                <p className="text-sm text-slate-500">{s.durationMin} min · {Number(s.pricePln)} zł{s.category ? ` · ${s.category}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${s.isActive ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                >
                  {s.isActive ? "Aktywna" : "Ukryta"}
                </button>
                <button onClick={() => startEdit(s)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
