import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchHeader } from "./SearchHeader";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, kategoria, miasto } = await searchParams;
  return buildMetadata(
    "search",
    {
      q: q || kategoria || "usługi",
      city: miasto || "Polska",
      category: kategoria || "",
    },
    { alternates: { canonical: "/szukaj" } }
  );
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
];

interface Props {
  searchParams: Promise<{ q?: string; kategoria?: string; miasto?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, kategoria, miasto } = await searchParams;

  const where: Record<string, unknown> = { isActive: true };
  const andConditions: Record<string, unknown>[] = [];

  if (q) {
    andConditions.push({ displayName: { contains: q, mode: "insensitive" } });
  }
  if (kategoria) {
    andConditions.push({ category: { contains: kategoria, mode: "insensitive" } });
  }
  if (miasto) {
    andConditions.push({ city: { contains: miasto, mode: "insensitive" } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const providers = await prisma.provider.findMany({
    where,
    include: {
      services: { where: { isActive: true }, orderBy: { pricePln: "asc" }, take: 1 },
      reviews: { where: { isApproved: true }, select: { rating: true } },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tighter text-slate-900 shrink-0">
            REZERWUJ
          </Link>
          <SearchHeader initialQ={q ?? ""} initialMiasto={miasto ?? ""} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Results header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {providers.length === 0
              ? "Brak wyników"
              : `${providers.length} ${providers.length === 1 ? "wynik" : providers.length < 5 ? "wyniki" : "wyników"}`}
            {q ? ` dla „${q}"` : ""}
          </h1>
          {kategoria && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {kategoria}
            </span>
          )}
          {miasto && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              {miasto}
            </span>
          )}
        </div>

        {/* No results */}
        {providers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-2 text-lg">Nie znaleziono wyników</p>
            <p className="text-slate-400 text-sm mb-6">Spróbuj zmienić kryteria wyszukiwania</p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Wróć na stronę główną
            </Link>
          </div>
        )}

        {/* Results grid */}
        {providers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {providers.map((provider, i) => {
              const reviewCount = provider.reviews.length;
              const avgRating = reviewCount
                ? (provider.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1)
                : null;
              const minPrice = provider.services[0]?.pricePln;
              const image = provider.coverImage ?? PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];

              return (
                <Link key={provider.id} href={`/${provider.slug}`} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 mb-3">
                    <Image
                      src={image}
                      alt={provider.displayName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {avgRating && (
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-white">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {avgRating}
                        <span className="text-white/60 font-normal">{reviewCount} opinii</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {provider.displayName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {provider.city ?? provider.category ?? "Polska"}
                  </p>
                  {minPrice !== undefined && minPrice !== null && (
                    <p className="text-xs font-medium text-slate-600 mt-1">od {Number(minPrice)} zł</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
