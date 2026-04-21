import { prisma } from "@/lib/prisma";
import { Users, Briefcase, CalendarCheck, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const [userCount, providerCount, bookingCount, completedCount] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { service: true, provider: true },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">Statystyki platformy</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users} label="Użytkownicy" value={userCount} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Briefcase} label="Aktywni usługodawcy" value={providerCount} color="bg-green-50 text-green-600" />
        <StatCard icon={CalendarCheck} label="Rezerwacje łącznie" value={bookingCount} color="bg-orange-50 text-orange-600" />
        <StatCard icon={TrendingUp} label="Zakończone wizyty" value={completedCount} color="bg-slate-100 text-slate-600" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Ostatnie rezerwacje</h2>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3">Usługodawca</th>
              <th className="text-left px-5 py-3">Usługa</th>
              <th className="text-left px-5 py-3">Klient</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentBookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-800">{b.provider.displayName}</td>
                <td className="px-5 py-3 text-slate-600">{b.service.name}</td>
                <td className="px-5 py-3 text-slate-500">{b.guestName ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                    b.status === "CANCELLED" ? "bg-gray-100 text-gray-500" :
                    b.status === "CONFIRMED" ? "bg-indigo-50 text-indigo-700" :
                    "bg-yellow-50 text-yellow-700"
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
