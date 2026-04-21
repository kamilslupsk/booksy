"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service, VacationBlock, AvailabilityRule } from "@prisma/client";
import { useBookingWizard } from "@/hooks/useBookingWizard";
import { ServiceSelector } from "./ServiceSelector";
import { DateTimePicker } from "./DateTimePicker";
import { AuthGate } from "./AuthGate";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  providerId: string;
  providerSlug: string;
  services: Service[];
  vacationBlocks: VacationBlock[];
  availabilityRules: AvailabilityRule[];
  isLoggedIn: boolean;
  clientName?: string;
}

const STEP_LABELS = ["Usługa", "Termin", "Konto"];

export function BookingWizard({
  providerId, providerSlug, services, vacationBlocks, availabilityRules, isLoggedIn, clientName,
}: Props) {
  const router = useRouter();
  const { state, setService, setDate, setSlot, next, prev, canNext } = useBookingWizard();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!state.selectedService || !state.selectedDate || !state.selectedSlot) return;
    if (!isLoggedIn) { toast.error("Zaloguj się aby potwierdzić rezerwację"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: state.selectedService.id,
          providerId,
          date: format(state.selectedDate, "yyyy-MM-dd"),
          time: state.selectedSlot,
          guestName: clientName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Coś poszło nie tak");
        return;
      }

      const { cancelToken } = await res.json();
      router.push(
        `/${providerSlug}/confirm?token=${cancelToken}&service=${encodeURIComponent(state.selectedService.name)}&date=${format(state.selectedDate, "d MMMM yyyy", { locale: pl })}&time=${state.selectedSlot}`
      );
    } catch {
      toast.error("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  const showConfirmButton = state.step === 3 && isLoggedIn;

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left */}
      <div className="lg:col-span-7">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const active = state.step === stepNum;
            const done = state.step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  done ? "bg-indigo-600 text-white" : active ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {done ? "✓" : stepNum}
                </div>
                <span className={`text-sm ${active ? "font-semibold text-slate-900" : "text-slate-400"}`}>{label}</span>
                {i < 2 && <div className="w-6 h-px bg-gray-200 mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {state.step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
              Wybierz usługę
            </h2>
            <ServiceSelector services={services} selected={state.selectedService} onSelect={setService} />
          </div>
        )}

        {/* Step 2 — mobile only */}
        {state.step === 2 && state.selectedService && (
          <div className="lg:hidden">
            <DateTimePicker
              providerSlug={providerSlug}
              serviceId={state.selectedService.id}
              serviceDurationMin={state.selectedService.durationMin}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              vacationBlocks={vacationBlocks}
              availabilityRules={availabilityRules}
              onDateSelect={setDate}
              onSlotSelect={setSlot}
            />
          </div>
        )}

        {/* Step 3 */}
        {state.step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">3</span>
              {isLoggedIn ? "Potwierdź rezerwację" : "Zaloguj się aby zarezerwować"}
            </h2>

            {/* Summary */}
            {state.selectedService && state.selectedDate && state.selectedSlot && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-5 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-900">{state.selectedService.name}</p>
                <p className="text-sm text-indigo-700 mt-1">
                  {format(state.selectedDate, "d MMMM yyyy", { locale: pl })} · {state.selectedSlot}
                </p>
                <p className="text-sm font-semibold text-indigo-900 mt-1">
                  {Number(state.selectedService.pricePln)} zł
                </p>
              </div>
            )}

            {isLoggedIn ? (
              <p className="text-sm text-slate-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
                Rezerwujesz jako <strong>{clientName}</strong>.
              </p>
            ) : (
              <AuthGate />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {state.step > 1 && (
            <Button variant="outline" onClick={prev} className="flex-1">← Wstecz</Button>
          )}
          {state.step < 3 ? (
            <Button onClick={next} disabled={!canNext} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Dalej →
            </Button>
          ) : showConfirmButton ? (
            <Button onClick={handleConfirm} disabled={submitting} className="flex-1 bg-slate-900 hover:bg-slate-800">
              {submitting ? "Rezerwowanie..." : "Potwierdź rezerwację"}
            </Button>
          ) : null}
        </div>

        {state.step < 3 && (
          <p className="text-xs text-center text-slate-400 mt-3">Nie pobieramy opłaty przy rezerwacji.</p>
        )}
      </div>

      {/* Right: calendar — desktop always visible */}
      {state.selectedService && (
        <div className="lg:col-span-5 hidden lg:block sticky top-24">
          <DateTimePicker
            providerSlug={providerSlug}
            serviceId={state.selectedService.id}
            serviceDurationMin={state.selectedService.durationMin}
            selectedDate={state.selectedDate}
            selectedSlot={state.selectedSlot}
            vacationBlocks={vacationBlocks}
            availabilityRules={availabilityRules}
            onDateSelect={(d) => { setDate(d); if (state.step === 1) next(); }}
            onSlotSelect={setSlot}
          />
        </div>
      )}
    </div>
  );
}
