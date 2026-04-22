import { NextRequest } from "next/server";
import { sendOtp, normalizePhone } from "@/lib/sms";
import { OtpSendSchema, parseJson, jsonError } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 3 OTP / 10 min per IP — limits SMS pumping abuse.
  const limited = enforceRateLimit(req, { name: "otp-ip", limit: 3, windowSec: 600 });
  if (limited) return limited;

  const parsed = await parseJson(req, OtpSendSchema);
  if ("error" in parsed) return parsed.error;

  const e164 = normalizePhone(parsed.data.phone);
  if (!e164.startsWith("+") || e164.length < 10) {
    return jsonError("Nieprawidłowy numer telefonu", 422);
  }

  // 5 OTP / hour per phone number — prevents targeted flooding.
  const perPhone = enforceRateLimit(req, { name: "otp-phone", limit: 5, windowSec: 3600 }, e164);
  if (perPhone) return perPhone;

  try {
    await sendOtp(e164);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("OTP send error:", err);
    return jsonError("Nie udało się wysłać kodu", 500);
  }
}
