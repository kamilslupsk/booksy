import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard, Calendar, Settings, Image as ImageIcon,
  MessageSquare, Clock, Scissors, LogOut
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Kalendarz", icon: Calendar },
  { href: "/dashboard/services", label: "Usługi", icon: Scissors },
  { href: "/dashboard/availability", label: "Dostępność", icon: Clock },
  { href: "/dashboard/gallery", label: "Galeria", icon: ImageIcon },
  { href: "/dashboard/reviews", label: "Opinie", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Ustawienia", icon: Settings },
];

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col text-slate-300 shrink-0">
        <div className="mb-2">
          <div className="text-lg font-semibold tracking-tighter text-white">
            REZERWUJ{" "}
            <span className="text-xs font-normal text-slate-500 tracking-normal ml-1">Biznes</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 mb-10 truncate">Panel usługodawcy</div>

        <nav className="flex-1 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-3">
          <p className="text-xs text-slate-500 truncate">{session.user.email ?? session.user.name}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors w-full px-1">
              <LogOut className="w-3.5 h-3.5" /> Wyloguj się
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
