"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfilPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/client/profile").then((r) => r.json()).then((d) => {
      setName(d.name ?? "");
      setPhone(d.phone ?? "");
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil zaktualizowany");
    } catch {
      toast.error("Coś poszło nie tak");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400">Ładowanie...</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Mój profil</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <Label htmlFor="name">Imię i nazwisko</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Anna Kowalska" />
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" placeholder="+48 000 000 000" />
        </div>
        <Button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800">
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </form>
    </div>
  );
}
