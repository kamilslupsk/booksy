import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarDays, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function KlientDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, bookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    prisma.booking.findMany({
      where: { clientId: session.user.id, startTime: { gte: new Date() }, status: { notIn: ["CANCELLED", "NO_SHOW"] } },
      include: { service: true, provider: true },
      orderBy: { startTime: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg">
            {(user?.name ?? user?.email ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name ?? "Klient"}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <Link href="/klient/profil" className="ml-auto flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            <User className="w-4 h-4" /> Edytuj profil
          </Link>
        </div>
      </div>

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Nadchodzące wizyty</h2>
          <Link href="/klient/bookings" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            Wszystkie <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <CalendarDays className="w-9 h-9 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-slate-400 mb-3">Brak nadchodzących wizyt</p>
            <Link href="/" className="text-sm text-indigo-600 hover:underline">Zarezerwuj usługę →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/klient/bookings/${b.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-semibold">{format(b.startTime, "d MMM", { locale: pl })}</span>
                  <span className="text-[11px]">{format(b.startTime, "HH:mm")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{b.service.name}</p>
                  <p className="text-sm text-slate-500">{b.provider.displayName} · {Number(b.service.pricePln)} zł</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
