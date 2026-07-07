import { useMemo } from "react";
import type { LogEntry } from "./utils";
import { getYearWeeks, getCellColor, toDateStr } from "./utils";

const DAY_LABELS = ["Lun", "", "Mié", "", "Vie", "", ""];
const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

type YearlyViewProps = {
  anchorDate: Date;
  logMap: Map<string, LogEntry>;
  todayStr: string;
  onToggleDay: (dateStr: string) => Promise<void>;
  onCellHover: (dateStr: string | null, rect?: { left: number; width: number; top: number }) => void;
};

export default function YearlyView({
  anchorDate, logMap, todayStr,
  onToggleDay, onCellHover,
}: YearlyViewProps) {
  const year = anchorDate.getFullYear();
  const weeks = useMemo(() => getYearWeeks(year), [year]);

  const monthMarkers = useMemo(() => {
    const markers: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const wed = week[3];
      if (wed.getMonth() !== lastMonth) {
        markers.push({ weekIndex: i, label: MONTH_NAMES[wed.getMonth()] });
        lastMonth = wed.getMonth();
      }
    });
    return markers;
  }, [weeks]);

  return (
    <div>
      <p className="text-lg font-bold text-on-surface mb-3">{year}</p>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-[3px]">
          {/* Month labels */}
          <div className="flex ml-[30px]">
            {weeks.map((_, i) => {
              const marker = monthMarkers.find((m) => m.weekIndex === i);
              return (
                <div
                  key={i}
                  className="text-[10px] text-gray-400 leading-none h-3"
                  style={{ width: 13, marginRight: 2 }}
                >
                  {marker ? marker.label : ""}
                </div>
              );
            })}
          </div>

          {/* Day rows */}
          {Array.from({ length: 7 }, (_, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-[2px]">
              <span className="w-[28px] text-[10px] text-gray-400 text-right pr-1.5 leading-none">
                {DAY_LABELS[dayIdx]}
              </span>
              {weeks.map((week) => {
                const date = week[dayIdx];
                const dateStr = toDateStr(date);
                const log = logMap.get(dateStr);
                const ratio = log ? log.completedBy / log.totalMembers : 0;
                const isFuture = dateStr > todayStr;
                const isToday = dateStr === todayStr;
                const isInYear = date.getFullYear() === year;
                const cellColor = isInYear ? getCellColor(ratio, isFuture) : "bg-gray-50";

                return (
                  <button
                    key={dateStr}
                    onClick={() => onToggleDay(dateStr)}
                    onMouseEnter={(e) => onCellHover(dateStr, e.currentTarget.getBoundingClientRect())}
                    onMouseLeave={() => onCellHover(null)}
                    disabled={isFuture}
                    className={`w-[13px] h-[13px] rounded-[2px] flex-shrink-0 transition-colors ${
                      cellColor
                    } ${
                      isToday ? "ring-2 ring-secondary ring-inset" : ""
                    } ${
                      isInYear && !isFuture ? "cursor-pointer hover:opacity-80" : "cursor-default"
                    }`}
                    aria-label={dateStr}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 justify-end">
        <span>Menos</span>
        <span className="w-[13px] h-[13px] rounded bg-gray-200" />
        <span className="w-[13px] h-[13px] rounded bg-primary-light" />
        <span className="w-[13px] h-[13px] rounded bg-primary" />
        <span className="w-[13px] h-[13px] rounded bg-primary-dark" />
        <span>Más</span>
      </div>
    </div>
  );
}
