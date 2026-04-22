import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  email: z.string().email().max(120).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
});

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
  const limited = enforceRateLimit(req, { name: "register", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  const parsed = await parseJson(req, RegisterSchema);
  if ("error" in parsed) return parsed.error;
  const { email, password, displayName, category } = parsed.data;

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
              // Cryptographically strong referral code — not predictable from Math.random.
              code: randomBytes(6).toString("base64url"),
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
