"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, User, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/klient", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/klient/bookings", label: "Moje wizyty", icon: CalendarDays, exact: false },
  { href: "/klient/profil", label: "Profil", icon: User, exact: true },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 flex-1 justify-center">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "text-indigo-600 bg-indigo-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
