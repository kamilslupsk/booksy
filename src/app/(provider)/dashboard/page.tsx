import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.providerId) redirect("/register");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [todayBookings, weekBookings, totalBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        providerId: session.user.providerId,
        startTime: { gte: today, lt: tomorrow },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { service: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        providerId: session.user.providerId,
        startTime: { gte: today },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
    }),
    prisma.booking.count({
      where: {
        providerId: session.user.providerId,
        status: "COMPLETED",
      },
    }),
  ]);

  const weekRevenue = weekBookings.reduce((sum, b) => sum + Number(b.service.pricePln), 0);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pulpit</h1>
        <p className="text-sm text-slate-500 mt-1">{format(today, "EEEE, d MMMM yyyy", { locale: pl })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Calendar} label="Dziś" value={todayBookings.length} unit="wizyt" color="indigo" />
        <StatCard icon={TrendingUp} label="Ten tydzień" value={`${weekRevenue} zł`} unit="przychód" color="green" />
        <StatCard icon={Users} label="Łącznie" value={totalBookings} unit="ukończonych" color="slate" />
        <StatCard icon={Clock} label="Oczekujące" value={weekBookings.filter(b => b.status === "PENDING").length} unit="rezerwacji" color="orange" />
      </div>

      {/* Today's bookings */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Dzisiejsze wizyty</h2>
      {todayBookings.length === 0 ? (
        <p className="text-slate-400 text-sm">Brak wizyt na dziś.</p>
      ) : (
        <div className="space-y-3">
          {todayBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0 text-center">
                <span className="text-xs font-medium">{format(booking.startTime, "HH:mm")}</span>
                <span className="text-[10px] text-indigo-400">{booking.service.durationMin}min</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{booking.service.name}</p>
                <p className="text-sm text-slate-500">{booking.guestName ?? "Klient"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-slate-900">{Number(booking.service.pricePln)} zł</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}>
                  {booking.status === "CONFIRMED" ? "Potwierdzone" : "Oczekuje"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    slate: "bg-slate-100 text-slate-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label} · {unit}</p>
    </div>
  );
}
