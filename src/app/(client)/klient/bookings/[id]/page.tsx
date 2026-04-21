import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Clock, Tag } from "lucide-react";
import { CancelBookingButton } from "@/components/client/CancelBookingButton";
import { ReviewFormWrapper } from "@/components/client/ReviewFormWrapper";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Oczekuje na potwierdzenie", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Potwierdzone",              cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED: { label: "Zakończone",                cls: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Odwołane",                  cls: "bg-gray-50 text-gray-500 border-gray-200" },
  NO_SHOW:   { label: "Nieobecność",               cls: "bg-red-50 text-red-600 border-red-200" },
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [booking, existingReview] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: { service: true, provider: true },
    }),
    prisma.review.findUnique({ where: { bookingId: id } }),
  ]);

  if (!booking || booking.clientId !== session.user.id) notFound();

  const st = STATUS_LABEL[booking.status] ?? STATUS_LABEL.PENDING;
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const isFuture = new Date(booking.startTime) > new Date();
  const canReview = booking.status === "COMPLETED" && !existingReview;

  return (
    <div className="max-w-lg">
      <Link href="/klient/bookings" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Wróć do wizyt
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Szczegóły rezerwacji</h1>

      <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium mb-5 ${st.cls}`}>
        {st.label}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="bg-indigo-600 text-white px-6 py-5">
          <p className="text-2xl font-bold">{format(booking.startTime, "d MMMM yyyy", { locale: pl })}</p>
          <p className="text-indigo-200 text-sm mt-1">{format(booking.startTime, "EEEE", { locale: pl })}</p>
          <p className="text-3xl font-bold mt-2">{format(booking.startTime, "HH:mm")}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Usługa</p>
              <p className="font-medium text-slate-900">{booking.service.name}</p>
              <p className="text-sm text-slate-500">{Number(booking.service.pricePln)} zł · {booking.service.durationMin} min</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Usługodawca</p>
              <p className="font-medium text-slate-900">{booking.provider.displayName}</p>
            </div>
          </div>

          {booking.provider.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Adres</p>
                <p className="text-sm text-slate-700">
                  {booking.provider.address}{booking.provider.city ? `, ${booking.provider.city}` : ""}
                </p>
              </div>
            </div>
          )}

          {booking.provider.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Telefon</p>
                <a href={`tel:${booking.provider.phone}`} className="text-sm text-indigo-600 hover:underline">
                  {booking.provider.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review form for completed bookings */}
      {canReview && <ReviewFormWrapper bookingId={booking.id} />}

      {/* Already reviewed */}
      {booking.status === "COMPLETED" && existingReview && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 text-sm text-green-700">
          Twoja opinia została przesłana — dziękujemy!
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-4">
        {isFuture && canCancel && <CancelBookingButton cancelToken={booking.cancelToken} />}
        <Link
          href={`/${booking.provider.slug}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors"
        >
          Zarezerwuj ponownie u {booking.provider.displayName}
        </Link>
        <Link
          href="/klient/bookings"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Wróć do listy wizyt
        </Link>
      </div>
    </div>
  );
}
