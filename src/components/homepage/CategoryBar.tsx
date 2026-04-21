import Link from "next/link";
import { Scissors, Sparkles, Dumbbell, Heart, Flower2, Smile, Eye, Zap } from "lucide-react";

const categories = [
  { label: "Fryzjer",          icon: Scissors, slug: "fryzjer" },
  { label: "Barber shop",      icon: Scissors, slug: "barber" },
  { label: "Salon kosmetyczny",icon: Sparkles,  slug: "kosmetyka" },
  { label: "Paznokcie",        icon: Sparkles,  slug: "paznokcie" },
  { label: "Fizjoterapia",     icon: Heart,     slug: "fizjoterapia" },
  { label: "Brwi i rzęsy",     icon: Eye,       slug: "brwi-rzesy" },
  { label: "Masaż",            icon: Flower2,   slug: "masaz" },
  { label: "Trener",           icon: Dumbbell,  slug: "trener" },
  { label: "Makijaż",          icon: Smile,     slug: "makijaz" },
  { label: "Depilacja",        icon: Zap,       slug: "depilacja" },
];

export function CategoryBar() {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {categories.map(({ label, icon: Icon, slug }) => (
            <Link
              key={slug}
              href={`/szukaj?kategoria=${slug}`}
              className="flex flex-col items-center gap-1.5 px-4 md:px-6 py-4 whitespace-nowrap text-slate-600 hover:text-indigo-600 transition-colors group shrink-0"
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
