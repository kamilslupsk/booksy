import Link from "next/link";
import { CheckCircle, Calendar, Clock, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; service?: string; date?: string; time?: string }>;
}

export default async function ConfirmPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token, service, date, time } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Rezerwacja potwierdzona!</h1>
        <p className="text-sm text-slate-500 mb-8">
          Wyślemy Ci SMS z przypomnieniem przed wizytą.
        </p>

        {(service || date || time) && (
          <div className="bg-indigo-50 rounded-xl p-5 mb-8 text-left border border-indigo-100 space-y-3">
            {service && (
              <div className="flex items-center gap-3">
                <Scissors className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-medium text-indigo-900">{service}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm text-indigo-800">{date}</span>
              </div>
            )}
            {time && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm text-indigo-800">{time}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link href={`/${slug}`}>
            <Button variant="outline" className="w-full">
              Wróć do profilu
            </Button>
          </Link>

          {token && (
            <Link href={`/cancel/${token}`}>
              <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2">
                Chcę odwołać rezerwację
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
