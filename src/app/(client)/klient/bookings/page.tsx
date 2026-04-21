import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Oczekuje",     cls: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Potwierdzone", cls: "bg-teal-100 text-teal-800" },
  COMPLETED: { label: "Zakończone",   cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Anulowana",    cls: "bg-red-100 text-red-700" },
  NO_SHOW:   { label: "Nieobecność",  cls: "bg-gray-100 text-gray-600" },
};

export default async function ClientBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    include: { service: true, provider: true },
    orderBy: { startTime: "desc" },
  });

  const upcoming = bookings.filter(
    (b) => new Date(b.startTime) >= new Date() && b.status !== "CANCELLED" && b.status !== "NO_SHOW"
  );
  const past = bookings.filter(
    (b) => new Date(b.startTime) < new Date() || b.status === "CANCELLED" || b.status === "NO_SHOW"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Wizyty</h1>

      {bookings.length === 0 && (
        <div className="text-center py-20">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-slate-400 text-sm mb-4">Nie masz jeszcze żadnych rezerwacji</p>
          <Link href="/" className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            Znajdź usługodawcę
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Nadchodzące wizyty</h2>
          <div className="space-y-3">
            {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Zakończone wizyty</h2>
          <div className="space-y-3">
            {past.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}

type BookingRow = Awaited<ReturnType<typeof prisma.booking.findMany>>[0] & {
  service: { name: string; pricePln: unknown; durationMin: number };
  provider: { displayName: string; slug: string; coverImage: string | null };
};

function BookingCard({ booking }: { booking: BookingRow }) {
  const st = STATUS_LABEL[booking.status] ?? STATUS_LABEL.PENDING;
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const isFuture = new Date(booking.startTime) > new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        {/* Left content */}
        <div className="flex-1 p-5">
          {/* Status */}
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3 ${st.cls}`}>
            {st.label}
          </span>

          {/* Service */}
          <p className="font-semibold text-slate-900 text-sm mb-1">{booking.service.name}</p>

          {/* Provider */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
              {booking.provider.displayName[0]}
            </div>
            <span className="text-sm text-slate-500">{booking.provider.displayName}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${booking.provider.slug}`}
              className="inline-block px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Umów ponownie
            </Link>
            {isFuture && canCancel && (
              <Link
                href={`/klient/bookings/${booking.id}`}
                className="text-sm text-slate-400 hover:text-red-500 transition-colors"
              >
                Zarządzaj
              </Link>
            )}
          </div>
        </div>

        {/* Right: date */}
        <div className="w-20 flex flex-col items-center justify-center bg-gray-50 border-l border-gray-100 shrink-0 py-4">
          <span className="text-xs text-slate-400 font-medium uppercase">
            {format(booking.startTime, "MMM", { locale: pl })}
          </span>
          <span className="text-3xl font-bold text-slate-900 leading-none my-1">
            {format(booking.startTime, "d")}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            {format(booking.startTime, "HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
}
