import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendCancellationEmail } from "@/lib/email";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: {
      service: { include: { provider: { select: { displayName: true } } } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  if (booking.clientId !== session.user.id) return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") {
    return NextResponse.json({ error: "Nie można odwołać zakończonej wizyty" }, { status: 409 });
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });

  if (session.user.email) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });
    const clientEmail = clientUser?.email ?? session.user.email;
    const clientName = clientUser?.name ?? session.user.name ?? "Klient";
    const dateFormatted = format(booking.startTime, "d MMMM yyyy", { locale: pl });

    sendCancellationEmail(clientEmail, {
      clientName,
      service: booking.service.name,
      date: dateFormatted,
      providerName: booking.service.provider.displayName,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
