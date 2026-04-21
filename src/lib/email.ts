import { Resend } from "resend";

const FROM = "Rezerwuj <noreply@rezerwuj.pl>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

export async function sendBookingConfirmationEmail(
  to: string,
  data: {
    clientName: string;
    providerName: string;
    service: string;
    date: string;
    time: string;
    price: string;
    cancelUrl: string;
  }
) {
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === "development") {
    console.log(`[EMAIL DEV] Booking confirmation to ${to}`, data);
    return;
  }

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Potwierdzenie wizyty — ${data.service} u ${data.providerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#4f46e5">Twoja wizyta jest potwierdzona!</h2>
        <p>Cześć ${data.clientName},</p>
        <p>Twoja wizyta została zarezerwowana:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 0;color:#666">Usługa</td><td style="padding:6px 0;font-weight:600">${data.service}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Usługodawca</td><td style="padding:6px 0;font-weight:600">${data.providerName}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Data</td><td style="padding:6px 0">${data.date}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Godzina</td><td style="padding:6px 0">${data.time}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Cena</td><td style="padding:6px 0">${data.price} zł</td></tr>
        </table>
        <p><a href="${data.cancelUrl}" style="color:#ef4444">Anuluj wizytę</a></p>
      </div>
    `,
  });
}

export async function sendCancellationEmail(
  to: string,
  data: { clientName: string; service: string; date: string; providerName: string }
) {
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === "development") {
    console.log(`[EMAIL DEV] Cancellation to ${to}`, data);
    return;
  }

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Wizyta anulowana — ${data.service}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Wizyta anulowana</h2>
        <p>Cześć ${data.clientName},</p>
        <p>Twoja wizyta na <strong>${data.service}</strong> u <strong>${data.providerName}</strong> w dniu <strong>${data.date}</strong> została anulowana.</p>
      </div>
    `,
  });
}
