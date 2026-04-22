import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { phone as phoneSchema } from "@/lib/validation";

const RegisterClientSchema = z.object({
  name: z.string().trim().min(1).max(80).optional().nullable(),
  email: z.string().email().max(120).toLowerCase().trim(),
  phone: phoneSchema.optional().nullable(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { name: "register-client", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  const parsed = await parseJson(req, RegisterClientSchema);
  if ("error" in parsed) return parsed.error;
  const { name, email, phone, password } = parsed.data;

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
