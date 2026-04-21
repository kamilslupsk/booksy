import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Rezerwuj <noreply@rezerwuj.pl>";

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
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL DEV] Booking confirmation to ${to}`, data);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Potwierdzenie wizyty — ${data.service} u ${data.providerName}`,
    html: `
      <h2>Twoja wizyta jest potwierdzona!</h2>
      <p>Cześć ${data.clientName},</p>
      <p>Twoja wizyta została zarezerwowana:</p>
      <ul>
        <li><strong>Usługa:</strong> ${data.service}</li>
        <li><strong>Usługodawca:</strong> ${data.providerName}</li>
        <li><strong>Data:</strong> ${data.date}</li>
        <li><strong>Godzina:</strong> ${data.time}</li>
        <li><strong>Cena:</strong> ${data.price} PLN</li>
      </ul>
      <p><a href="${data.cancelUrl}">Anuluj wizytę</a></p>
    `,
  });
}

export async function sendCancellationEmail(
  to: string,
  data: { clientName: string; service: string; date: string; providerName: string }
) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL DEV] Cancellation to ${to}`, data);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Wizyta anulowana — ${data.service}`,
    html: `
      <h2>Wizyta anulowana</h2>
      <p>Cześć ${data.clientName},</p>
      <p>Twoja wizyta na <strong>${data.service}</strong> u <strong>${data.providerName}</strong> w dniu ${data.date} została anulowana.</p>
    `,
  });
}
