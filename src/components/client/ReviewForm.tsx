"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function ReviewForm({ bookingId, onSubmitted }: { bookingId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast.error("Wybierz ocenę"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/client/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, content }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Błąd"); return; }
      toast.success("Dziękujemy za opinię!");
      onSubmitted();
    } catch {
      toast.error("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
      <p className="text-sm font-semibold text-indigo-900">Oceń wizytę</p>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                s <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Komentarz (opcjonalnie)..."
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        type="submit"
        disabled={loading || !rating}
        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Wysyłanie..." : "Wyślij opinię"}
      </button>
    </form>
  );
}
