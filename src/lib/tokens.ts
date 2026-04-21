import { randomBytes } from "crypto";

export function generateCancelToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateReferralCode(displayName: string): string {
  const base = displayName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const suffix = randomBytes(2).toString("hex");
  return `${base}${suffix}`;
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
