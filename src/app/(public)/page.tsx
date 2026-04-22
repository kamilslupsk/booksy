import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("home", {}, { alternates: { canonical: "/" } });
}
import { HeroSlider } from "@/components/homepage/HeroSlider";
import { CategoryBar } from "@/components/homepage/CategoryBar";
import { FeaturedGrid } from "@/components/homepage/FeaturedGrid";
import { SearchBar } from "@/components/common/SearchBar";
import { User, LogIn, Building2 } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isProvider = session?.user?.role === "PROVIDER" || session?.user?.role === "ADMIN";
  const isClient = isLoggedIn && !isProvider;

  return (
    <main className="bg-white">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[540px] md:min-h-[600px] flex flex-col overflow-hidden bg-slate-900">
        <HeroSlider />

        {/* ── Navbar ── */}
        <header className="relative z-10 w-full px-5 md:px-10 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter text-white drop-shadow">
            REZERWUJ
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Client auth button */}
            {isClient ? (
              <Link
                href="/klient/bookings"
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xs font-bold">
                  {(session.user?.name ?? session.user?.email ?? "?")[0].toUpperCase()}
                </div>
                <span className="hidden md:inline">Mój panel</span>
              </Link>
            ) : isProvider ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xs font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="hidden md:inline">Panel firmy</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:inline">Zaloguj się / Załóż konto</span>
              </Link>
            )}

            {/* Business button — always visible */}
            {!isProvider && (
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Dodaj swój biznes</span>
              </Link>
            )}
          </div>
        </header>

        {/* ── Hero copy + search ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-16 pt-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4 leading-tight max-w-3xl">
            Znajdź i zarezerwuj<br className="hidden md:block" /> usługi w Twojej okolicy
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-10 max-w-xl">
            Fryzjerzy, salony, trenerzy — rezerwuj online w kilka sekund.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* ── CATEGORY BAR ─────────────────────────────────────── */}
      <CategoryBar />

      {/* ── FEATURED ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Polecane</h2>
        <FeaturedGrid />
      </section>

      {/* ── B2B CTA ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-6">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prowadzisz salon lub studio?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Zacznij przyjmować rezerwacje online w 3 minuty.
            Pierwsze 90 dni bezpłatnie — bez karty.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors shadow-lg text-sm"
            >
              Zacznij bezpłatnie →
            </Link>
            <Link
              href="/login"
              className="inline-block px-8 py-3.5 rounded-full border border-slate-600 text-slate-300 font-medium hover:border-slate-400 hover:text-white transition-colors text-sm"
            >
              Mam już konto
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
