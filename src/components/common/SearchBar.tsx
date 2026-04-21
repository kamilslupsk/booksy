"use client";

import { useState } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (what) params.set("q", what);
    if (where) params.set("miasto", where);
    if (when) params.set("data", when);
    window.location.href = `/szukaj?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-4xl w-full rounded-full bg-white p-2.5 shadow-[0_20px_50px_rgb(0,0,0,0.15)] flex flex-col md:flex-row items-center gap-2">
      <div className="flex-1 flex items-center px-4 py-2 w-full">
        <Search className="text-indigo-500 w-5 h-5 mr-3 shrink-0" />
        <input
          type="text"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Czego szukasz? (np. Paznokcie, Fryzjer)"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-slate-900 font-medium"
        />
      </div>
      <div className="hidden md:block w-px h-8 bg-gray-200" />
      <div className="flex-1 flex items-center px-4 py-2 w-full border-t md:border-t-0 border-gray-100">
        <MapPin className="text-indigo-500 w-5 h-5 mr-3 shrink-0" />
        <input
          type="text"
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Gdzie?"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-slate-900 font-medium"
        />
      </div>
      <div className="hidden md:block w-px h-8 bg-gray-200" />
      <div className="flex-1 flex items-center px-4 py-2 w-full border-t md:border-t-0 border-gray-100">
        <Calendar className="text-indigo-500 w-5 h-5 mr-3 shrink-0" />
        <input
          type="date"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-slate-900 font-medium"
        />
      </div>
      <Button
        onClick={handleSearch}
        className="w-full md:w-auto mt-2 md:mt-0 rounded-full bg-indigo-600 hover:bg-indigo-700 px-8"
      >
        Szukaj
      </Button>
    </div>
  );
}
