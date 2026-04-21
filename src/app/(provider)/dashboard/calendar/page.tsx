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

  const [services, bookings, vacationBlocks] = await Promise.all([
    prisma.service.findMany({
      where: { providerId: session.user.providerId, isActive: true },
      select: { id: true, name: true, durationMin: true, pricePln: true },
    }),
    prisma.booking.findMany({
      where: {
        providerId: session.user.providerId,
        startTime: { gte: weekStart, lte: weekEnd },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.vacationBlock.findMany({
      where: { providerId: session.user.providerId },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    guestName: b.guestName ?? "Klient",
    guestPhone: b.guestPhone ?? null,
    serviceName: b.service.name,
    pricePln: Number(b.service.pricePln),
  }));

  const serializedServices = services.map((s) => ({ ...s, pricePln: String(s.pricePln) }));

  const serializedVacations = vacationBlocks.map((v) => ({
    id: v.id,
    startDate: v.startDate.toISOString().split("T")[0],
    endDate: v.endDate.toISOString().split("T")[0],
    reason: v.reason ?? "",
  }));

  return (
    <WeekCalendar
      bookings={serializedBookings}
      weekStart={weekStart.toISOString()}
      services={serializedServices}
      vacationBlocks={serializedVacations}
    />
  );
}
