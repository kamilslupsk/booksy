import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true, email: true } });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, phone } = await req.json();
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null, phone: phone || null },
  });
  return NextResponse.json({ name: updated.name, phone: updated.phone });
}
