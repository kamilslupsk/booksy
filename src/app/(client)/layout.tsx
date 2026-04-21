import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientSidebar } from "@/components/client/ClientSidebar";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, image: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 px-4 h-13 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tighter text-indigo-600">REZERWUJ</Link>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button type="submit" className="text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-1">
            Wyloguj
          </button>
        </form>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-100">
            <Link href="/" className="text-base font-semibold tracking-tighter text-indigo-600">REZERWUJ</Link>
          </div>

          {/* Profile */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-semibold shrink-0">
                  {(user?.name ?? user?.email ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user?.name ?? "Klient"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.phone ?? user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <ClientSidebar />

          {/* Logout at bottom */}
          <div className="mt-auto px-4 py-4 border-t border-gray-100">
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                Wyloguj się
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Mobile nav tabs */}
          <div className="md:hidden bg-white border-b border-gray-100 px-4">
            <ClientSidebar mobile />
          </div>
          <div className="p-4 md:p-8 max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
