import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const provider = await prisma.provider.findUnique({
    where: { slug, isActive: true },
    include: {
      services: { where: { isActive: true }, orderBy: { category: "asc" } },
      availabilityRules: true,
      vacationBlocks: {
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!provider) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  return NextResponse.json(provider);
}
