import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Star } from "lucide-react";
import { ReviewActions } from "@/components/provider/ReviewActions";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.providerId) redirect("/login");

  const reviews = await prisma.review.findMany({
    where: { providerId: session.user.providerId },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Opinie</h1>
        <p className="text-sm text-slate-500 mt-1">Zatwierdź lub ukryj opinie klientów.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-16">Brak opinii do moderacji.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${r.isApproved ? "border-green-100" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">
                      {format(r.createdAt, "d MMM yyyy", { locale: pl })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{r.content ?? <span className="italic text-slate-400">Brak komentarza</span>}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {r.booking.service.name} · {r.booking.guestName ?? "Klient"}
                  </p>
                </div>
                <ReviewActions reviewId={r.id} isApproved={r.isApproved} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
