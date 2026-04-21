"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ACTIONS: { status: string; label: string; cls: string }[] = [
  { status: "CONFIRMED", label: "Potwierdź", cls: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100" },
  { status: "COMPLETED", label: "Zakończ", cls: "bg-green-50 text-green-700 hover:bg-green-100 border-green-100" },
  { status: "NO_SHOW", label: "Nieobecność", cls: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100" },
  { status: "CANCELLED", label: "Anuluj", cls: "bg-red-50 text-red-600 hover:bg-red-100 border-red-100" },
];

export function BookingStatusActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const available = ACTIONS.filter((a) => a.status !== currentStatus);

  async function changeStatus(status: string) {
    setLoading(true);
    try {
      await fetch("/api/provider/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status }),
      });
      toast.success("Status zaktualizowany");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {available.map((a) => (
        <button
          key={a.status}
          onClick={() => changeStatus(a.status)}
          disabled={loading}
          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${a.cls}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
