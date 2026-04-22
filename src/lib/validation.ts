// Shared Zod schemas for API input validation.
// Prefer these over ad-hoc destructuring from `req.json()`.

import { z } from "zod";
import { NextResponse } from "next/server";

// --- Primitives ---

export const cuid = z.string().regex(/^c[a-z0-9]{20,30}$/i, "Invalid id");
export const slug = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9-]+$/, "Invalid slug");

// Accept +48XXXXXXXXX or 9 digits; we normalize downstream via normalizePhone.
export const phone = z
  .string()
  .trim()
  .min(9)
  .max(16)
  .regex(/^[+0-9 ]+$/, "Invalid phone");

export const safeName = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[\p{L}\p{M}0-9 .,'\-]+$/u, "Invalid characters");

export const timeHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const dateISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

// --- Endpoint schemas ---

export const BookingCreateSchema = z.object({
  serviceId: cuid,
  providerId: cuid,
  date: dateISO,
  time: timeHHMM,
  guestName: safeName.optional(),
  guestPhone: phone.optional(),
  // honeypot — bots fill it; humans never see it
  website: z.string().max(0).optional(),
});

export const BookingCancelSchema = z.object({
  token: z.string().min(10).max(40),
});

export const OtpSendSchema = z.object({
  phone,
});

export const OtpVerifySchema = z.object({
  phone,
  code: z.string().regex(/^\d{4,8}$/),
});

export const ReviewCreateSchema = z.object({
  bookingId: cuid,
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
});

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: jsonError("Invalid JSON", 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: jsonError(
        `Nieprawidłowe dane: ${first?.path.join(".") || "body"} — ${first?.message}`,
        422
      ),
    };
  }
  return { data: parsed.data };
}
