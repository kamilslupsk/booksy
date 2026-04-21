"use client";

import { useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { useRouter } from "next/navigation";

export function ReviewFormWrapper({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 text-sm text-green-700">
        Twoja opinia została przesłana — dziękujemy!
      </div>
    );
  }

  return (
    <div className="mb-4">
      <ReviewForm bookingId={bookingId} onSubmitted={() => { setSubmitted(true); router.refresh(); }} />
    </div>
  );
}
