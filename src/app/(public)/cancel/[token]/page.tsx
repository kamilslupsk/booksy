import { notFound } from "next/navigation";
import Link from "next/link";
import { XCircle, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CancelPage({ params }: Props) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { service: true },
  });

  if (!booking) notFound();

  const alreadyCancelled = booking.status === "CANCELLED";
  const alreadyCompleted = booking.status === "COMPLETED" || booking.status === "NO_SHOW";

  if (!alreadyCancelled && !alreadyCompleted) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Nie można odwołać</h1>
          <p className="text-sm text-slate-500">Ta wizyta już się odbyła lub jest w trakcie realizacji.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          {alreadyCancelled ? "Wizyta już odwołana" : "Wizyta odwołana"}
        </h1>

        <p className="text-sm text-slate-500 mb-6">
          {alreadyCancelled
            ? "Ta rezerwacja została już wcześniej anulowana."
            : "Twoja rezerwacja została pomyślnie odwołana."}
        </p>

        {booking.service && (
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
            <p className="text-sm font-medium text-slate-700">{booking.service.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {format(new Date(booking.startTime), "d MMMM yyyy · HH:mm", { locale: pl })}
            </p>
          </div>
        )}

        <Link href="/">
          <Button variant="outline" className="w-full">
            Strona główna
          </Button>
        </Link>
      </div>
    </div>
  );
}
