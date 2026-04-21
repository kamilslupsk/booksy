import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays, User, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-semibold tracking-tighter text-indigo-600">REZERWUJ</Link>
          <nav className="flex items-center gap-1">
            <Link href="/klient/bookings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-gray-50 hover:text-slate-900 transition-colors">
              <CalendarDays className="w-4 h-4" /> Moje wizyty
            </Link>
            <Link href="/klient/profil" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-gray-50 hover:text-slate-900 transition-colors">
              <User className="w-4 h-4" /> Profil
            </Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
