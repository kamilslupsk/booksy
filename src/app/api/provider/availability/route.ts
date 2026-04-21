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

  const rules = await prisma.availabilityRule.findMany({
    where: { providerId },
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json(rules);
}

export async function PUT(req: Request) {
  const providerId = await getProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules: { dayOfWeek: number; startTime: string; endTime: string }[] = await req.json();

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({ where: { providerId } }),
    ...rules.map((r) =>
      prisma.availabilityRule.create({
        data: { providerId, dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}
