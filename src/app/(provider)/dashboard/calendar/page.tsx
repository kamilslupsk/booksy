import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WeekCalendar } from "@/components/provider/WeekCalendar";
import { startOfWeek, endOfWeek } from "date-fns";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.providerId) redirect("/login");

  const { week } = await searchParams;
  const baseDate = week ? new Date(week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });

  const bookings = await prisma.booking.findMany({
    where: {
      providerId: session.user.providerId,
      startTime: { gte: weekStart, lte: weekEnd },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    include: { service: true },
    orderBy: { startTime: "asc" },
  });

  const serialized = bookings.map((b) => ({
    id: b.id,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    guestName: b.guestName ?? "Klient",
    guestPhone: b.guestPhone ?? null,
    serviceName: b.service.name,
    pricePln: Number(b.service.pricePln),
  }));

  return <WeekCalendar bookings={serialized} weekStart={weekStart.toISOString()} />;
}
