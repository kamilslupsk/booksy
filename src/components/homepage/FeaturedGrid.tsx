import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
];

async function getFeaturedProviders() {
  try {
    return await prisma.provider.findMany({
      where: { isActive: true },
      include: {
        services: { where: { isActive: true }, orderBy: { pricePln: "asc" }, take: 1 },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function FeaturedGrid() {
  const providers = await getFeaturedProviders();

  if (providers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        Wkrótce pojawią się pierwsze oferty...
      </div>
    );
  }

  return (
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
            <p className="text-xs text-slate-400 truncate mt-0.5">{provider.category ?? provider.city ?? "Polska"}</p>
            {minPrice !== undefined && minPrice !== null && (
              <p className="text-xs font-medium text-slate-600 mt-1">od {Number(minPrice)} zł</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
