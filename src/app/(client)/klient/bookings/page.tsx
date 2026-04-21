import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Oczekuje",     cls: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  CONFIRMED: { label: "Potwierdzone", cls: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  COMPLETED: { label: "Zakończone",   cls: "bg-green-50 text-green-700 border-green-100" },
  CANCELLED: { label: "Odwołane",     cls: "bg-gray-50 text-gray-500 border-gray-200" },
  NO_SHOW:   { label: "Nieobecność",  cls: "bg-red-50 text-red-600 border-red-100" },
};

export default async function ClientBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    include: { service: true, provider: true },
    orderBy: { startTime: "desc" },
  });

  const upcoming = bookings.filter((b) => new Date(b.startTime) >= new Date() && b.status !== "CANCELLED");
  const past = bookings.filter((b) => new Date(b.startTime) < new Date() || b.status === "CANCELLED");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Moje wizyty</h1>

      {bookings.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nie masz jeszcze żadnych rezerwacji.</p>
          <Link href="/" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">Znajdź usługodawcę →</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Nadchodzące</h2>
          <div className="space-y-3">
            {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Historia</h2>
          <div className="space-y-3 opacity-70">
            {past.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: Awaited<ReturnType<typeof prisma.booking.findMany>>[0] & { service: { name: string; pricePln: unknown }; provider: { displayName: string; slug: string } } }) {
  const st = STATUS_LABEL[booking.status] ?? STATUS_LABEL.PENDING;
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0 text-center">
        <span className="text-xs font-semibold">{format(booking.startTime, "d MMM", { locale: pl })}</span>
        <span className="text-[11px]">{format(booking.startTime, "HH:mm")}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{booking.service.name}</p>
        <p className="text-sm text-slate-500">
          {booking.provider.displayName} · {Number(booking.service.pricePln)} zł
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${st.cls}`}>{st.label}</span>
        {canCancel && (
          <Link href={`/cancel/${booking.cancelToken}`} className="text-xs text-slate-400 hover:text-red-600 transition-colors">
            Odwołaj
          </Link>
        )}
      </div>
    </div>
  );
}
