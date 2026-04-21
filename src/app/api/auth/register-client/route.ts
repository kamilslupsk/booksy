import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, password } = await req.json();

  if (!email || !password) return NextResponse.json({ error: "Email i hasło są wymagane" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Hasło musi mieć co najmniej 8 znaków" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Konto z tym emailem już istnieje" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: name || null,
      phone: phone || null,
      role: "CLIENT",
    },
  });

  return NextResponse.json({ ok: true });
}
