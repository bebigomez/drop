import type { LogEntry } from "./utils";
import { getMonthGrid, getCellColor, toDateStr } from "./utils";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

type MonthlyViewProps = {
  anchorDate: Date;
  logMap: Map<string, LogEntry>;
  todayStr: string;
  onToggleDay: (dateStr: string) => Promise<void>;
  onCellHover: (dateStr: string | null, rect?: { left: number; width: number; top: number }) => void;
};

export default function MonthlyView({
  anchorDate, logMap, todayStr,
  onToggleDay, onCellHover,
}: MonthlyViewProps) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const weeks = getMonthGrid(year, month);

  return (
    <div>
      <p className="text-lg font-bold text-on-surface capitalize mb-3">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-semibold text-on-surface/30 uppercase tracking-wider py-1">
            {label}
          </div>
        ))}
        {weeks.flat().map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = toDateStr(date);
          const log = logMap.get(dateStr);
          const ratio = log ? log.completedBy / log.totalMembers : 0;
          const isFuture = dateStr > todayStr;
          const isToday = dateStr === todayStr;
          const cellColor = getCellColor(ratio, isFuture);

          return (
            <button
              key={dateStr}
              onClick={() => onToggleDay(dateStr)}
              onMouseEnter={(e) => onCellHover(dateStr, e.currentTarget.getBoundingClientRect())}
              onMouseLeave={() => onCellHover(null)}
              disabled={isFuture}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                isFuture
                  ? "bg-gray-50 text-gray-300 cursor-default"
                  : `${cellColor} ${
                      isToday ? "text-white font-bold ring-2 ring-secondary ring-offset-1" : "text-on-surface"
                    } cursor-pointer hover:opacity-80`
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
