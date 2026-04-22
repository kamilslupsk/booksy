import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewCreateSchema, parseJson } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 20 reviews / hour / user — covers retries but stops spam.
  const limited = enforceRateLimit(req, { name: "review", limit: 20, windowSec: 3600 }, session.user.id);
  if (limited) return limited;

  const parsed = await parseJson(req, ReviewCreateSchema);
  if ("error" in parsed) return parsed.error;
  const { bookingId, rating, content } = parsed.data;

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
