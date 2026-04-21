import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getProvider() {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId) return null;
  return prisma.provider.findUnique({
    where: { id: providerId },
    include: { vacationBlocks: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" } } },
  });
}

export async function GET() {
  const provider = await getProvider();
  if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    displayName: provider.displayName,
    slug: provider.slug,
    bio: provider.bio ?? "",
    address: provider.address ?? "",
    city: provider.city ?? "",
    phone: provider.phone ?? "",
    category: provider.category ?? "",
    slotStepMin: provider.slotStepMin,
    vacationBlocks: provider.vacationBlocks.map((v) => ({
      id: v.id,
      startDate: v.startDate.toISOString().split("T")[0],
      endDate: v.endDate.toISOString().split("T")[0],
      reason: v.reason ?? "",
    })),
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, slug, bio, address, city, phone, category, slotStepMin, vacationBlocks } = await req.json();

  const slugConflict = await prisma.provider.findFirst({
    where: { slug, NOT: { id: providerId } },
  });
  if (slugConflict) return NextResponse.json({ error: "Ten slug jest już zajęty" }, { status: 409 });

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data: {
        displayName,
        slug,
        bio: bio || null,
        address: address || null,
        city: city || null,
        phone: phone || null,
        category: category || null,
        slotStepMin: Number(slotStepMin),
      },
    });

    await tx.vacationBlock.deleteMany({ where: { providerId } });

    for (const v of vacationBlocks) {
      if (!v.startDate || !v.endDate) continue;
      await tx.vacationBlock.create({
        data: {
          providerId,
          startDate: new Date(v.startDate),
          endDate: new Date(v.endDate),
          reason: v.reason || null,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
