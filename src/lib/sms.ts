import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID!;
const fromNumber = process.env.TWILIO_FROM_NUMBER!;

function getClient() {
  return twilio(accountSid, authToken);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("48")) return `+${digits}`;
  if (digits.length === 9) return `+48${digits}`;
  return `+${digits}`;
}

export async function sendOtp(phone: string): Promise<void> {
  const e164 = normalizePhone(phone);

  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS DEV] OTP for ${e164}: check Twilio dashboard or logs`);
    return;
  }

  await getClient().verify.v2.services(verifySid).verifications.create({
    to: e164,
    channel: "sms",
  });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const e164 = normalizePhone(phone);

  if (process.env.NODE_ENV === "development" && code === "123456") {
    return true;
  }

  try {
    const result = await getClient()
      .verify.v2.services(verifySid)
      .verificationChecks.create({ to: e164, code });
    return result.status === "approved";
  } catch {
    return false;
  }
}

export async function sendBookingConfirmationToClient(
  phone: string,
  data: { providerName: string; date: string; time: string; service: string; cancelUrl: string }
): Promise<void> {
  const e164 = normalizePhone(phone);
  const body =
    `Potwierdzenie wizyty: ${data.service} u ${data.providerName} ` +
    `dnia ${data.date} o ${data.time}. ` +
    `Aby anulować: ${data.cancelUrl}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS DEV] → ${e164}: ${body}`);
    return;
  }

  await getClient().messages.create({ to: e164, from: fromNumber, body });
}

export async function sendBookingNotificationToProvider(
  phone: string,
  data: { clientName: string; date: string; time: string; service: string }
): Promise<void> {
  const e164 = normalizePhone(phone);
  const body =
    `Nowa rezerwacja: ${data.clientName} — ${data.service} ` +
    `${data.date} o ${data.time}.`;

  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS DEV] → ${e164}: ${body}`);
    return;
  }

  await getClient().messages.create({ to: e164, from: fromNumber, body });
}

export async function sendReviewRequest(
  phone: string,
  data: { providerName: string; reviewUrl: string }
): Promise<void> {
  const e164 = normalizePhone(phone);
  const body =
    `Jak oceniasz wizytę u ${data.providerName}? ` +
    `Zostaw opinię: ${data.reviewUrl}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS DEV] → ${e164}: ${body}`);
    return;
  }

  await getClient().messages.create({ to: e164, from: fromNumber, body });
}
