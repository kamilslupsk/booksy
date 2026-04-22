import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MapPin, Phone, Star, User, LogIn } from "lucide-react";
import { VacationBanner } from "@/components/booking/VacationBanner";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { buildMetadata, getSiteSettings, localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: { displayName: true, bio: true, city: true, category: true, coverImage: true, isActive: true },
  });
  if (!provider) return { title: "Nie znaleziono", robots: { index: false, follow: false } };
  return buildMetadata(
    "provider",
    {
      displayName: provider.displayName,
      city: provider.city ?? "",
      category: provider.category ?? "usługi",
    },
    {
      alternates: { canonical: `/${slug}` },
      openGraph: provider.coverImage ? { images: [provider.coverImage] } : undefined,
      robots: provider.isActive ? undefined : { index: false, follow: false },
    }
  );
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const provider = await prisma.provider.findUnique({
    where: { slug, isActive: true },
    include: {
      services: { where: { isActive: true }, orderBy: { category: "asc" } },
      availabilityRules: true,
      vacationBlocks: {
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      },
      reviews: { where: { isApproved: true }, select: { rating: true } },
    },
  });

  if (!provider) notFound();

  const siteSettings = await getSiteSettings();
  const businessLd = localBusinessJsonLd(
    {
      displayName: provider.displayName,
      slug: provider.slug,
      bio: provider.bio,
      address: provider.address,
      city: provider.city,
      phone: provider.phone,
      coverImage: provider.coverImage,
      category: provider.category,
      galleryImages: provider.galleryImages,
      reviews: provider.reviews,
    },
    siteSettings.siteUrl
  );

  const avgRating = provider.reviews.length
    ? (provider.reviews.reduce((s, r) => s + r.rating, 0) / provider.reviews.length).toFixed(1)
    : null;

  const coverImage =
    provider.coverImage ??
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920";

  return (
    <div className="min-h-screen bg-white pb-24">
      <JsonLd data={businessLd} />
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tighter text-indigo-600">REZERWUJ</Link>
          {session?.user ? (
            <Link href="/klient" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              <User className="w-4 h-4" /> Mój panel
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              <LogIn className="w-4 h-4" /> Zaloguj się
            </Link>
          )}
        </div>
      </div>

      {/* Cover */}
      <div className="relative w-full h-48 md:h-64 bg-gray-200 overflow-hidden">
        <Image src={coverImage} alt={provider.displayName} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        {/* Provider card */}
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden shrink-0">
              {provider.coverImage ? (
                <Image src={provider.coverImage} alt={provider.displayName} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {provider.displayName[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-slate-900">
                {provider.displayName}
              </h1>
              {provider.address && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" /> {provider.address}{provider.city ? `, ${provider.city}` : ""}
                </p>
              )}
              {avgRating && (
                <div className="flex items-center gap-2 mt-1.5 text-sm font-medium">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{avgRating}</span>
                  <span className="text-slate-400">· {provider.reviews.length} opinii</span>
                </div>
              )}
            </div>
          </div>

          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-4 h-4" /> Zadzwoń
            </a>
          )}
        </div>

        {/* Vacation banner */}
        <VacationBanner vacationBlocks={provider.vacationBlocks} />

        {/* Bio */}
        {provider.bio && (
          <p className="mt-6 text-slate-600 text-sm leading-relaxed max-w-2xl">{provider.bio}</p>
        )}

        {/* Gallery */}
        {provider.galleryImages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Galeria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {provider.galleryImages.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt={`${provider.displayName} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="200px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking wizard */}
        {provider.services.length === 0 ? (
          <div className="mt-10 text-center py-16 text-slate-400">
            Usługodawca nie dodał jeszcze żadnych usług.
          </div>
        ) : (
          <BookingWizard
            providerId={provider.id}
            providerSlug={provider.slug}
            services={provider.services}
            vacationBlocks={provider.vacationBlocks}
            availabilityRules={provider.availabilityRules}
            isLoggedIn={!!session?.user}
            clientName={session?.user?.name ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
