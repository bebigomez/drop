import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type LogEntry = {
  date: string;
  completedBy: number;
  totalMembers: number;
  userIds: string[];
};

type ContributionCalendarProps = {
  habitId: string;
  logs: LogEntry[];
};

const DAY_LABELS = ["Lun", "", "Mié", "", "Vie", "", ""];

function getCellColor(ratio: number, isFuture: boolean): string {
  if (isFuture) return "bg-gray-100";
  if (ratio === 0) return "bg-gray-200";
  if (ratio < 0.5) return "bg-primary-light";
  if (ratio < 1) return "bg-primary";
  return "bg-primary-dark";
}

function formatTooltip(dateStr: string, completedBy: number, totalMembers: number): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const dayName = dayNames[d.getDay()];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  return `${dayName} ${day} de ${month} · ${completedBy}/${totalMembers} miembros completaron`;
}

export default function ContributionCalendar({ habitId, logs }: ContributionCalendarProps) {
  const toggleLog = useMutation(api.habit_mutations.toggleLog);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const logMap = new Map(logs.map((l) => [l.date, l]));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 34);

  const gridStart = new Date(startDate);
  const startDay = gridStart.getDay();
  gridStart.setDate(gridStart.getDate() - (startDay === 0 ? 6 : startDay - 1));

  const gridEnd = new Date(today);
  const endDay = gridEnd.getDay();
  gridEnd.setDate(gridEnd.getDate() + (endDay === 0 ? 0 : 7 - endDay));

  const allDates: string[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    allDates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: string[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  const handleCellClick = async (dateStr: string) => {
    if (dateStr > todayStr) return;
    try {
      await toggleLog({ habitId: habitId as any, date: dateStr });
    } catch {
      // error handling
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, dateStr: string) => {
    const log = logMap.get(dateStr);
    if (!log) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      text: formatTooltip(dateStr, log.completedBy, log.totalMembers),
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="relative">
      <div className="inline-block">
        <table className="border-separate border-spacing-[1px]">
          <tbody>
            {Array.from({ length: 7 }, (_, dayIdx) => (
              <tr key={dayIdx}>
                <td className="text-[10px] text-gray-400 pr-1.5 h-[13px] align-middle leading-none">
                  {DAY_LABELS[dayIdx]}
                </td>
                {weeks.map((week, weekIdx) => {
                  const dateStr = week[dayIdx];
                  const log = logMap.get(dateStr);
                  const isFuture = dateStr > todayStr;
                  const isToday = dateStr === todayStr;
                  const isInRange = dateStr >= startDate.toISOString().slice(0, 10) && dateStr <= todayStr;
                  const ratio = log ? log.completedBy / log.totalMembers : 0;
                  const cellColor = isInRange ? getCellColor(ratio, isFuture) : "bg-gray-100";

                  return (
                    <td key={weekIdx} className="p-0">
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={dateStr > todayStr}
                        onClick={() => handleCellClick(dateStr)}
                        onMouseEnter={(e) => handleMouseEnter(e, dateStr)}
                        onMouseLeave={handleMouseLeave}
                        className={`block w-[13px] h-[13px] rounded-[2px] ${cellColor} ${isToday ? "ring-2 ring-secondary ring-inset" : ""} ${isInRange && !isFuture ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-colors`}
                        aria-label={dateStr}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 text-xs text-white bg-on-surface rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
