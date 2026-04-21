"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Props { reviewId: string; isApproved: boolean; }

export function ReviewActions({ reviewId, isApproved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch("/api/provider/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, isApproved: !isApproved }),
      });
      toast.success(isApproved ? "Opinia ukryta" : "Opinia zatwierdzona");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
        isApproved
          ? "border-gray-200 text-slate-500 hover:bg-gray-50"
          : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
      }`}
    >
      {isApproved ? <><EyeOff className="w-3.5 h-3.5" /> Ukryj</> : <><Check className="w-3.5 h-3.5" /> Zatwierdź</>}
    </button>
  );
}
