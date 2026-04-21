import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/slots";
import { sendBookingConfirmationToClient, sendBookingNotificationToProvider } from "@/lib/sms";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { serviceId, providerId, date, time, guestName, guestPhone } = body;

  if (!serviceId || !providerId || !date || !time) {
    return NextResponse.json({ error: "Brakujące dane" }, { status: 400 });
  }

  const isGuest = !session?.user;
  if (isGuest && (!guestName || !guestPhone)) {
    return NextResponse.json({ error: "Podaj imię i telefon" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: { select: { id: true, displayName: true, phone: true, slug: true } } },
  });
  if (!service) return NextResponse.json({ error: "Usługa nie istnieje" }, { status: 404 });

  const bookingDate = new Date(date);
  const slots = await getAvailableSlots(providerId, bookingDate, serviceId);
  const requestedSlot = slots.find((s) => s.time === time && s.available);
  if (!requestedSlot) {
    return NextResponse.json({ error: "Ten termin jest niedostępny" }, { status: 409 });
  }

  const [startH, startM] = time.split(":").map(Number);
  const startTime = new Date(bookingDate);
  startTime.setHours(startH, startM, 0, 0);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

  const booking = await prisma.booking.create({
    data: {
      serviceId,
      providerId,
      clientId: session?.user?.id ?? null,
      guestName: isGuest ? guestName : (session?.user?.name ?? null),
      guestPhone: isGuest ? guestPhone : null,
      startTime,
      endTime,
      status: "CONFIRMED",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancelUrl = `${appUrl}/cancel/${booking.cancelToken}`;
  const clientName = isGuest ? guestName : (session?.user?.name ?? "Klient");
  const clientPhone = isGuest ? guestPhone : null;
  const dateFormatted = format(startTime, "d MMMM yyyy", { locale: pl });
  const timeFormatted = format(startTime, "HH:mm");

  if (clientPhone) {
    sendBookingConfirmationToClient(clientPhone, {
      providerName: service.provider.displayName,
      date: dateFormatted,
      time: timeFormatted,
      service: service.name,
      cancelUrl,
    }).catch(console.error);
  }

  if (service.provider.phone) {
    sendBookingNotificationToProvider(service.provider.phone, {
      clientName,
      date: dateFormatted,
      time: timeFormatted,
      service: service.name,
    }).catch(console.error);
  }

  return NextResponse.json({ bookingId: booking.id, cancelToken: booking.cancelToken });
}
