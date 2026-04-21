import { prisma } from "./prisma";

export interface TimeSlot {
  time: string;
  available: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAvailableSlots(
  providerId: string,
  date: Date,
  serviceId: string
): Promise<TimeSlot[]> {
  const dayOfWeek = (date.getDay() + 6) % 7; // 0=Mon … 6=Sun

  const [rule, service, vacationBlocks, bookings] = await Promise.all([
    prisma.availabilityRule.findUnique({
      where: { providerId_dayOfWeek: { providerId, dayOfWeek } },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.vacationBlock.findMany({
      where: {
        providerId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    }),
    prisma.booking.findMany({
      where: {
        providerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  if (!rule || !service || vacationBlocks.length > 0) return [];

  const stepMin = (await prisma.provider.findUnique({
    where: { id: providerId },
    select: { slotStepMin: true },
  }))?.slotStepMin ?? 30;

  const startMin = timeToMinutes(rule.startTime);
  const endMin = timeToMinutes(rule.endTime);
  const durationMin = service.durationMin;

  const occupied = bookings.map((b) => ({
    start: b.startTime.getHours() * 60 + b.startTime.getMinutes(),
    end: b.endTime.getHours() * 60 + b.endTime.getMinutes(),
  }));

  const slots: TimeSlot[] = [];
  let cursor = startMin;

  while (cursor + durationMin <= endMin) {
    const slotEnd = cursor + durationMin;
    const isOccupied = occupied.some(
      (o) => o.start < slotEnd && o.end > cursor
    );
    slots.push({ time: minutesToTime(cursor), available: !isOccupied });
    cursor += stepMin;
  }

  return slots;
}
