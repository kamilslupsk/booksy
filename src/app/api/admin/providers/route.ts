import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, isActive } = await req.json();
  const updated = await prisma.provider.update({ where: { id }, data: { isActive } });
  return NextResponse.json(updated);
}
