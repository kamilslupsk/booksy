import { NextRequest, NextResponse } from "next/server";
import { sendOtp, normalizePhone } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Brak numeru telefonu" }, { status: 400 });

  const e164 = normalizePhone(phone);

  try {
    await sendOtp(e164);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Nie udało się wysłać kodu" }, { status: 500 });
  }
}
