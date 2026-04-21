"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, User, Settings } from "lucide-react";

const links = [
  { href: "/klient/bookings", label: "Wizyty", icon: CalendarDays },
  { href: "/klient/profil", label: "Ustawienia konta", icon: Settings },
];

export function ClientSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex gap-0 overflow-x-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 rounded-l-none"
                : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
