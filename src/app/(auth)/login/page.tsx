"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Chrome } from "lucide-react";
import { toast } from "sonner";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Podaj poprawny numer telefonu (9 cyfr)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sms/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error();
      setStep("otp");
      toast.success("Wysłaliśmy kod SMS na Twój numer");
    } catch {
      toast.error("Nie udało się wysłać kodu. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Wpisz pełny 6-cyfrowy kod");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("phone-otp", {
        phone,
        code,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Nieprawidłowy lub wygasły kod. Spróbuj ponownie.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-xl font-semibold tracking-tighter text-indigo-600 mb-8">
          REZERWUJ
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {step === "phone" ? (
            <>
              <h1 className="text-xl font-semibold text-slate-900 mb-1">Zaloguj się</h1>
              <p className="text-sm text-slate-500 mb-6">Podaj numer telefonu — wyślemy Ci kod SMS.</p>

              <div className="space-y-4">
                <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
                <Button onClick={handleSendOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? "Wysyłanie..." : "Wyślij kod SMS"}
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase text-gray-400 bg-white px-2">
                  lub
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                disabled={loading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Kontynuuj z Google
              </Button>

              <p className="text-center text-xs text-slate-400 mt-6">
                Nie masz konta?{" "}
                <Link href="/register" className="text-indigo-600 hover:underline">
                  Zarejestruj się
                </Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("phone")} className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
                ← Wróć
              </button>
              <h1 className="text-xl font-semibold text-slate-900 mb-1">Wpisz kod</h1>
              <p className="text-sm text-slate-500 mb-6">
                Wysłaliśmy 6-cyfrowy kod na numer +48 {phone}
              </p>

              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
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

              <Button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Weryfikowanie..." : "Zaloguj się"}
              </Button>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-center text-sm text-indigo-600 hover:underline mt-4"
              >
                Wyślij kod ponownie
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
