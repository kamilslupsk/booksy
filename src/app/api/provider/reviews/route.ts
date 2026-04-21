import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  const providerId = session?.user?.providerId;
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, isApproved } = await req.json();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.providerId !== providerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.review.update({ where: { id }, data: { isApproved } });
  return NextResponse.json(updated);
}
