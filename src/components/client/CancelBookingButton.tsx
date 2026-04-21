"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CancelBookingButton({ cancelToken }: { cancelToken: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cancelToken }),
      });
      if (!res.ok) throw new Error();
      toast.success("Rezerwacja odwołana");
      router.refresh();
    } catch {
      toast.error("Nie udało się odwołać rezerwacji");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {loading ? "Odwoływanie..." : "Tak, odwołaj wizytę"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-slate-600 hover:bg-gray-50 transition-colors"
        >
          Anuluj
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
    >
      Odwołaj wizytę
    </button>
  );
}
