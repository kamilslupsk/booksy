import { Info } from "lucide-react";
import type { VacationBlock } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Props {
  vacationBlocks: VacationBlock[];
}

export function VacationBanner({ vacationBlocks }: Props) {
  if (vacationBlocks.length === 0) return null;

  const next = vacationBlocks[0];
  return (
    <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
      <Info className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-orange-800">Przerwa urlopowa</h4>
        <p className="text-xs text-orange-700 mt-1">
          W dniach{" "}
          <span className="font-semibold">
            {format(new Date(next.startDate), "d.MM.yyyy", { locale: pl })} –{" "}
            {format(new Date(next.endDate), "d.MM.yyyy", { locale: pl })}
          </span>{" "}
          {next.reason ?? "usługodawca będzie niedostępny"}.
        </p>
      </div>
    </div>
  );
}
