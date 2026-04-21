import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { cancelToken: token } });
  if (!booking) return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  if (booking.clientId !== session.user.id) return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") {
    return NextResponse.json({ error: "Nie można odwołać zakończonej wizyty" }, { status: 409 });
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
