import { NextResponse } from "next/server";

// Timing-safe, fail-closed cron secret check.
// Accepts either `Authorization: Bearer <SECRET>` (Vercel Cron convention)
// or `x-vercel-cron: 1` IF CRON_SECRET is unset (dev only).
export function verifyCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) {
    // Fail closed in production when secret is missing/weak.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Cron disabled: missing CRON_SECRET" }, { status: 503 });
    }
    // Allow in dev only if Vercel header is present.
    if (req.headers.get("x-vercel-cron") === "1") return null;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!timingSafeEqual(header, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
