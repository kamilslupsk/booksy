"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Chrome } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Fryzjer", "Paznokcie", "Makijaż", "Masaż", "Trener personalny",
  "Fotografia", "Kosmetyczka", "Tatuaż", "Inne",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
  }

  async function handleSendOtp() {
    if (!displayName.trim()) { toast.error("Podaj swoje imię lub nazwę"); return; }
    if (!category) { toast.error("Wybierz kategorię usług"); return; }
    if (phone.replace(/\D/g, "").length < 9) { toast.error("Podaj poprawny numer telefonu"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/sms/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error();
      setStep("otp");
      toast.success("Wysłaliśmy kod SMS");
    } catch {
      toast.error("Nie udało się wysłać kodu");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Wpisz pełny 6-cyfrowy kod"); return; }

    setLoading(true);
    try {
      const result = await signIn("phone-otp", { phone, code, redirect: false });
      if (result?.error) {
        toast.error("Nieprawidłowy lub wygasły kod");
        return;
      }

      // Create provider profile
      const slug = generateSlug(displayName);
      await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, category, slug }),
      });

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`reg-otp-${index + 1}`)?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-xl font-semibold tracking-tighter text-indigo-600 mb-8">
          REZERWUJ
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {step === "form" ? (
            <>
              <h1 className="text-xl font-semibold text-slate-900 mb-1">Utwórz profil</h1>
              <p className="text-sm text-slate-500 mb-6">Zacznij przyjmować rezerwacje w 3 minuty. Bez NIP, bez umów.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Twoje imię lub nazwa salonu</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="np. Ania Kowalska"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Kategoria usług</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          category === cat
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Numer telefonu</Label>
                  <div className="mt-1.5">
                    <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
                  </div>
                </div>

                <Button onClick={handleSendOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? "Wysyłanie..." : "Wyślij kod SMS"}
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase text-gray-400 bg-white px-2">lub</div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                <Chrome className="w-4 h-4 mr-2" />
                Kontynuuj z Google
              </Button>

              <p className="text-center text-xs text-slate-400 mt-6">
                Masz już konto?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline">Zaloguj się</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("form")} className="text-sm text-slate-400 hover:text-slate-600 mb-4">← Wróć</button>
              <h1 className="text-xl font-semibold text-slate-900 mb-1">Wpisz kod</h1>
              <p className="text-sm text-slate-500 mb-6">Wysłaliśmy 6-cyfrowy kod na numer +48 {phone}</p>

              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`reg-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              <Button onClick={handleVerify} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Tworzenie profilu..." : "Utwórz konto"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
