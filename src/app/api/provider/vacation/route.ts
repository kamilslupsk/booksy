import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getProviderId() {
  const session = await auth();
  return session?.user?.providerId ?? null;
}

export async function GET() {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocks = await prisma.vacationBlock.findMany({
    where: { providerId },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(blocks.map((b) => ({
    id: b.id,
    startDate: b.startDate.toISOString().split("T")[0],
    endDate: b.endDate.toISOString().split("T")[0],
    reason: b.reason ?? "",
  })));
}

export async function POST(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { startDate, endDate, reason } = await req.json();
  if (!startDate || !endDate) return NextResponse.json({ error: "Podaj daty" }, { status: 400 });

  const block = await prisma.vacationBlock.create({
    data: { providerId, startDate: new Date(startDate), endDate: new Date(endDate), reason: reason || null },
  });
  return NextResponse.json({ ...block, startDate: startDate, endDate: endDate });
}

export async function DELETE(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const block = await prisma.vacationBlock.findUnique({ where: { id } });
  if (!block || block.providerId !== providerId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.vacationBlock.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
