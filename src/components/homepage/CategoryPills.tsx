import { Scissors, Camera, Sparkles, Dumbbell, Heart, Flower2 } from "lucide-react";
import Link from "next/link";

const categories = [
  { label: "Paznokcie", icon: Sparkles, slug: "paznokcie" },
  { label: "Fryzjer", icon: Scissors, slug: "fryzjer" },
  { label: "Fotografia", icon: Camera, slug: "fotografia" },
  { label: "Trener", icon: Dumbbell, slug: "trener" },
  { label: "Masaż", icon: Heart, slug: "masaz" },
  { label: "Makijaż", icon: Flower2, slug: "makijaz" },
];

export function CategoryPills() {
  return (
    <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-12">
      {categories.map(({ label, icon: Icon, slug }) => (
        <Link
          key={slug}
          href={`/szukaj?kategoria=${slug}`}
          className="flex flex-col items-center gap-4 group"
        >
          <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-[1.25rem] md:rounded-[1.5rem] bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:-translate-y-1.5 group-hover:bg-white group-hover:text-indigo-600 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <Icon className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors drop-shadow-md">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
