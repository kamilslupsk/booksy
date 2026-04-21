import Link from "next/link";
import { HeroSlider } from "@/components/homepage/HeroSlider";
import { CategoryPills } from "@/components/homepage/CategoryPills";
import { FeaturedGrid } from "@/components/homepage/FeaturedGrid";
import { SearchBar } from "@/components/common/SearchBar";

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-slate-900">
        <HeroSlider />

        {/* Navbar */}
        <header className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tighter text-white drop-shadow-md">
            REZERWUJ
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/dla-firm" className="text-white/90 hover:text-white transition-colors drop-shadow-sm">
              Dla firm
            </Link>
            <Link href="/login" className="text-white/90 hover:text-white transition-colors drop-shadow-sm">
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-5 py-2.5 text-slate-900 hover:bg-gray-100 transition-colors shadow-lg text-sm font-medium"
            >
              Utwórz konto
            </Link>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 pb-32 text-center flex-1 flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6 drop-shadow-lg">
            Znajdź i zarezerwuj <br className="hidden md:block" />
            usługi w Twojej okolicy.
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md font-light">
            Od fryzjerów po stylistów paznokci. Wszystko w jednym miejscu,
            gotowe do rezerwacji w kilka sekund.
          </p>

          <SearchBar />
          <CategoryPills />
        </div>
      </section>

      {/* Featured providers */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-8">
          Polecane miejsca
        </h2>
        <FeaturedGrid />
      </section>

      {/* CTA dla usługodawców */}
      <section className="bg-indigo-600 py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">
          Jesteś usługodawcą?
        </h2>
        <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
          Zarejestruj się w 3 minuty i zacznij przyjmować rezerwacje online.
          Pierwsze 3 miesiące bezpłatnie.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-full bg-white text-indigo-600 font-semibold px-8 py-3.5 hover:bg-indigo-50 transition-colors shadow-lg"
        >
          Zacznij za darmo
        </Link>
      </section>
    </main>
  );
}
