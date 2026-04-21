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

  const services = await prisma.service.findMany({
    where: { providerId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category, durationMin, pricePln } = await req.json();
  const service = await prisma.service.create({
    data: { providerId, name, category: category || null, durationMin: Number(durationMin), pricePln },
  });
  return NextResponse.json(service);
}

export async function PATCH(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, category, durationMin, pricePln, isActive } = await req.json();

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || service.providerId !== providerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category: category || null }),
      ...(durationMin !== undefined && { durationMin: Number(durationMin) }),
      ...(pricePln !== undefined && { pricePln }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || service.providerId !== providerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
