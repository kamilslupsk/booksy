// Lightweight sliding-window rate limiter.
// In-memory Map (per-instance) — good enough for Vercel serverless
// where each cold instance has its own bucket. For strict distributed
// enforcement, wire up Upstash Redis via env vars and replace `memoryHit`.

import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

const GC_INTERVAL = 60_000;
let lastGc = Date.now();

function gc(now: number) {
  if (now - lastGc < GC_INTERVAL) return;
  lastGc = now;
  for (const [k, b] of store) if (b.resetAt < now) store.delete(k);
}

export interface LimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): LimitResult {
  const now = Date.now();
  gc(now);
  const resetAt = now + windowSec * 1000;
  const b = store.get(key);
  if (!b || b.resetAt < now) {
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: b.resetAt,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt, retryAfterSec: 0 };
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  // Vercel + most proxies set these; first entry is the real client.
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    h.get("x-real-ip") ??
    h.get("cf-connecting-ip") ??
    h.get("x-vercel-forwarded-for") ??
    "0.0.0.0"
  );
}

export interface RateLimitOptions {
  name: string;
  limit: number;
  windowSec: number;
  by?: "ip" | "user" | string;
}

/**
 * Enforce a rate limit and return a 429 response (or null to proceed).
 * Usage:
 *   const limited = await enforceRateLimit(req, { name: "otp", limit: 3, windowSec: 600 });
 *   if (limited) return limited;
 */
export function enforceRateLimit(
  req: Request,
  opts: RateLimitOptions,
  subjectId?: string | null
): NextResponse | null {
  const ip = getClientIp(req);
  const subject = subjectId ?? ip;
  const key = `${opts.name}:${subject}`;
  const res = rateLimit(key, opts.limit, opts.windowSec);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
      {
        status: 429,
        headers: {
          "Retry-After": String(res.retryAfterSec),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(res.resetAt / 1000)),
        },
      }
    );
  }
  return null;
}
