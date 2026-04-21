import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, time, serviceId, clientName, clientPhone, notes } = await req.json();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.providerId !== providerId) {
    return NextResponse.json({ error: "Nieznana usługa" }, { status: 400 });
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hour, minute);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      serviceId,
      providerId,
      guestName: clientName,
      guestPhone: clientPhone || null,
      notes: notes || null,
      startTime,
      endTime,
      status: "CONFIRMED",
    },
  });

  return NextResponse.json(booking);
}
