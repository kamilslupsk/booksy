import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { AdminToggle } from "@/components/admin/AdminToggle";

export default async function AccountsPage() {
  const providers = await prisma.provider.findMany({
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      subscription: { select: { status: true, trialEndsAt: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">Konta usługodawców</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3">Usługodawca</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Kategoria</th>
              <th className="text-left px-5 py-3">Abonament</th>
              <th className="text-left px-5 py-3">Rezerwacje</th>
              <th className="text-left px-5 py-3">Od</th>
              <th className="text-left px-5 py-3">Aktywny</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-800">{p.displayName}</p>
                  <p className="text-xs text-slate-400">/{p.slug}</p>
                </td>
                <td className="px-5 py-3 text-slate-500">{p.user.email ?? "—"}</td>
                <td className="px-5 py-3 text-slate-500">{p.category ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.subscription?.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                    p.subscription?.status === "TRIAL" ? "bg-indigo-50 text-indigo-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {p.subscription?.status ?? "brak"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{p._count.bookings}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {format(p.createdAt, "d MMM yyyy", { locale: pl })}
                </td>
                <td className="px-5 py-3">
                  <AdminToggle providerId={p.id} isActive={p.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
