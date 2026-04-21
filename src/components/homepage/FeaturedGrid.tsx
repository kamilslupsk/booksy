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
      take: 4,
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
      <div className="text-center py-12 text-slate-400">
        Wkrótce pojawią się pierwsze oferty...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {providers.map((provider, i) => {
        const avgRating = provider.reviews.length
          ? (provider.reviews.reduce((s, r) => s + r.rating, 0) / provider.reviews.length).toFixed(1)
          : null;
        const minPrice = provider.services[0]?.pricePln;
        const image = provider.coverImage ?? PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];

        return (
          <Link key={provider.id} href={`/${provider.slug}`} className="group cursor-pointer">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
              <Image
                src={image}
                alt={provider.displayName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {avgRating && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {avgRating}
                </div>
              )}
            </div>
            <h3 className="text-base font-medium text-slate-900 truncate">{provider.displayName}</h3>
            <p className="text-sm text-slate-500 mb-2 truncate">{provider.city ?? "Polska"}</p>
            {minPrice && (
              <p className="text-sm font-medium text-slate-900">od {Number(minPrice)} PLN</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
