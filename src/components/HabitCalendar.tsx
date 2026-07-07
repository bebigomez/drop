import { useState, useMemo, useCallback } from "react";
import { useMutation } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useToast } from "../hooks/useToast";
import type { LogEntry, MemberInfo, CalendarView } from "./calendar/utils";
import { formatTooltip, MONTH_NAMES, toDateStr } from "./calendar/utils";
import DailyView from "./calendar/DailyView";
import WeeklyView from "./calendar/WeeklyView";
import MonthlyView from "./calendar/MonthlyView";
import YearlyView from "./calendar/YearlyView";

type HabitCalendarProps = {
  habitId: string;
  logs: LogEntry[];
  members: MemberInfo[];
  currentUserId: string;
};

const VIEW_OPTIONS: { key: CalendarView; label: string }[] = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
  { key: "yearly", label: "Anual" },
];

export default function HabitCalendar({ habitId, logs, members, currentUserId }: HabitCalendarProps) {
  const [view, setView] = useState<CalendarView>("weekly");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const logMap = useMemo(() => new Map(logs.map((l) => [l.date, l])), [logs]);

  const today = useMemo(() => new Date(), []);
  const todayStr = toDateStr(today);

  const toggleLog = useMutation(api.habit_mutations.toggleLog);
  const { addToast } = useToast();

  const handleToggleDay = useCallback(async (dateStr: string) => {
    if (dateStr > todayStr) return;
    try {
      const result = await toggleLog({ habitId: habitId as any, date: dateStr });
      if (result.completed) {
        addToast("success", "¡Bien hecho!");
      } else {
        addToast("info", "Día marcado como pendiente");
      }
      result.achievements.forEach((a) => addToast("success", a.message));
    } catch {
      // error handling
    }
  }, [habitId, toggleLog, addToast, todayStr]);

  const navigate = useCallback((dir: -1 | 1) => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      switch (view) {
        case "daily": d.setDate(d.getDate() + dir); break;
        case "weekly": d.setDate(d.getDate() + dir * 7); break;
        case "monthly": d.setMonth(d.getMonth() + dir); break;
        case "yearly": d.setFullYear(d.getFullYear() + dir); break;
      }
      return d;
    });
  }, [view]);

  const resetToToday = useCallback(() => {
    setAnchorDate(new Date());
  }, []);

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
    setAnchorDate(new Date());
  }, []);

  const handleCellHover = useCallback((
    dateStr: string | null,
    rect?: { left: number; width: number; top: number },
  ) => {
    if (!dateStr || !rect) {
      setTooltip(null);
      return;
    }
    const log = logMap.get(dateStr);
    if (!log) return;
    setTooltip({
      text: formatTooltip(dateStr, log.completedBy, log.totalMembers),
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, [logMap]);

  const title = useMemo(() => {
    switch (view) {
      case "daily":
        return `${anchorDate.getDate()} de ${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
      case "weekly": {
        const monday = new Date(anchorDate);
        const day = monday.getDay();
        monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        if (monday.getMonth() === sunday.getMonth()) {
          return `${monday.getDate()} - ${sunday.getDate()} de ${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;
        }
        return `${monday.getDate()} de ${MONTH_NAMES[monday.getMonth()]} - ${sunday.getDate()} de ${MONTH_NAMES[sunday.getMonth()]} ${sunday.getFullYear()}`;
      }
      case "monthly":
        return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
      case "yearly":
        return `${anchorDate.getFullYear()}`;
    }
  }, [view, anchorDate]);

  return (
    <div>
      {/* View tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleViewChange(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === opt.key
                ? "bg-white text-on-surface shadow-sm"
                : "text-on-surface/40 hover:text-on-surface"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-on-surface/30 hover:text-on-surface rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={resetToToday}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Hoy
        </button>

        <p className="text-sm font-bold text-on-surface capitalize">{title}</p>

        <button
          onClick={() => navigate(1)}
          className="p-1.5 text-on-surface/30 hover:text-on-surface rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Calendar view */}
      <div className="relative min-h-[200px]">
        {view === "daily" && (
          <DailyView
            anchorDate={anchorDate}
            logMap={logMap}
            members={members}
            currentUserId={currentUserId}
            todayStr={todayStr}
            onToggleDay={handleToggleDay}
          />
        )}
        {view === "weekly" && (
          <WeeklyView
            anchorDate={anchorDate}
            logMap={logMap}
            members={members}
            todayStr={todayStr}
            onToggleDay={handleToggleDay}
            onCellHover={handleCellHover}
          />
        )}
        {view === "monthly" && (
          <MonthlyView
            anchorDate={anchorDate}
            logMap={logMap}
            todayStr={todayStr}
            onToggleDay={handleToggleDay}
            onCellHover={handleCellHover}
          />
        )}
        {view === "yearly" && (
          <YearlyView
            anchorDate={anchorDate}
            logMap={logMap}
            todayStr={todayStr}
            onToggleDay={handleToggleDay}
            onCellHover={handleCellHover}
          />
        )}
      </div>

      {/* Tooltip */}
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
