import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, rating, content } = await req.json();
  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { clientId: true, providerId: true, status: true },
  });

  if (!booking) return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  if (booking.clientId !== session.user.id) return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  if (booking.status !== "COMPLETED") return NextResponse.json({ error: "Opinie można wystawiać tylko po zakończonej wizycie" }, { status: 400 });

  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) return NextResponse.json({ error: "Opinia już istnieje" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      bookingId,
      providerId: booking.providerId,
      rating,
      content: content?.trim() || null,
      isApproved: false,
    },
  });

  return NextResponse.json({ id: review.id });
}
