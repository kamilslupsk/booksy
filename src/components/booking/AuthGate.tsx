"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Tab = "login" | "register";

export function AuthGate() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error("Podaj email i hasło"); return; }
    setLoading(true);
    try {
      const result = await signIn("email-password", { email: loginEmail, password: loginPassword, redirect: false });
      if (result?.error) { toast.error("Nieprawidłowy email lub hasło"); return; }
      toast.success("Zalogowano!");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim()) { toast.error("Podaj imię i nazwisko"); return; }
    if (!regEmail) { toast.error("Podaj adres email"); return; }
    if (regPassword.length < 8) { toast.error("Hasło musi mieć co najmniej 8 znaków"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Błąd rejestracji"); return; }

      const result = await signIn("email-password", { email: regEmail, password: regPassword, redirect: false });
      if (result?.error) { toast.error("Konto utworzone, zaloguj się ręcznie"); return; }
      toast.success("Konto utworzone!");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "login" ? "Mam konto" : "Nowe konto"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="anna@example.com" className="mt-1 text-sm" autoComplete="email" disabled={loading} />
            </div>
            <div>
              <Label className="text-xs">Hasło</Label>
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="mt-1 text-sm" autoComplete="current-password" disabled={loading} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-1">
              {loading ? "Logowanie..." : "Zaloguj się"}
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase text-gray-400 bg-white px-2">lub</div>
            </div>

            <Button type="button" variant="outline" className="w-full text-sm" onClick={() => signIn("google", { callbackUrl: window.location.href })} disabled={loading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Kontynuuj z Google
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <Label className="text-xs">Imię i nazwisko</Label>
              <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Anna Kowalska" className="mt-1 text-sm" disabled={loading} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="anna@example.com" className="mt-1 text-sm" autoComplete="email" disabled={loading} />
            </div>
            <div>
              <Label className="text-xs">Telefon</Label>
              <Input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+48 000 000 000" className="mt-1 text-sm" disabled={loading} />
            </div>
            <div>
              <Label className="text-xs">Hasło <span className="text-slate-400">(min. 8 znaków)</span></Label>
              <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="mt-1 text-sm" autoComplete="new-password" disabled={loading} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 mt-1">
              {loading ? "Tworzenie konta..." : "Utwórz konto i rezerwuj"}
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase text-gray-400 bg-white px-2">lub</div>
            </div>

            <Button type="button" variant="outline" className="w-full text-sm" onClick={() => signIn("google", { callbackUrl: window.location.href })} disabled={loading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Kontynuuj z Google
            </Button>
          </form>
        )}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Twoje dane są bezpieczne i nie będą udostępniane.
        </p>
      </div>
    </div>
  );
}
