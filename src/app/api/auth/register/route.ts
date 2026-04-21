import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

export async function POST(req: Request) {
  const { email, password, displayName, category } = await req.json();

  if (!email || !password || !displayName || !category) {
    return NextResponse.json({ error: "Uzupełnij wszystkie pola" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Hasło musi mieć co najmniej 8 znaków" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Konto z tym adresem email już istnieje" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const baseSlug = generateSlug(displayName);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.provider.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++attempt}`;
  }

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: displayName,
      role: "PROVIDER",
      provider: {
        create: {
          slug,
          displayName,
          category,
          isActive: true,
          subscription: {
            create: {
              status: "TRIAL",
              trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          },
          referralLink: {
            create: {
              code: Math.random().toString(36).slice(2, 10),
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
