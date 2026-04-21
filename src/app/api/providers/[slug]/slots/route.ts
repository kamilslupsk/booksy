import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = req.nextUrl;
  const dateStr = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: "Brak parametrów date lub serviceId" }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({ where: { slug }, select: { id: true } });
  if (!provider) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  const date = new Date(dateStr);
  const slots = await getAvailableSlots(provider.id, date, serviceId);

  return NextResponse.json(slots);
}
