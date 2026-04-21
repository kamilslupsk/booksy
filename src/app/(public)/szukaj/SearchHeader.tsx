"use client";

interface Props {
  initialQ: string;
  initialMiasto: string;
}

export function SearchHeader({ initialQ, initialMiasto }: Props) {
  return (
    <form method="GET" action="/szukaj" className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
      <input
        type="text"
        name="q"
        defaultValue={initialQ}
        placeholder="Czego szukasz? (np. Fryzjer, Masaż)"
        className="flex-1 px-4 py-2 rounded-full border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-900 placeholder:text-slate-400"
      />
      <input
        type="text"
        name="miasto"
        defaultValue={initialMiasto}
        placeholder="Miasto"
        className="sm:w-36 px-4 py-2 rounded-full border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-900 placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
      >
        Szukaj
      </button>
    </form>
  );
}
