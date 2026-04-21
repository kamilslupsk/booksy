import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 bg-slate-950 p-6 flex flex-col text-slate-300 shrink-0">
        <div className="text-base font-semibold tracking-tighter text-white mb-1">REZERWUJ</div>
        <div className="text-xs text-slate-500 mb-8">Panel admina</div>
        <nav className="flex-1 space-y-1">
          {[
            { href: "/admin/dashboard", label: "Statystyki", icon: LayoutDashboard },
            { href: "/admin/accounts", label: "Konta", icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-slate-600 mt-auto pt-4 border-t border-slate-800">{session.user.email}</p>
      </aside>
      <main className="flex-1 min-w-0 bg-gray-50">{children}</main>
    </div>
  );
}
