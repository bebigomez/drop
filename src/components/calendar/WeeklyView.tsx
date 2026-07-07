import type { LogEntry, MemberInfo } from "./utils";
import { getWeekDates, getMemberInitials, toDateStr } from "./utils";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type WeeklyViewProps = {
  anchorDate: Date;
  logMap: Map<string, LogEntry>;
  members: MemberInfo[];
  todayStr: string;
  onToggleDay: (dateStr: string) => Promise<void>;
  onCellHover: (dateStr: string | null, rect?: { left: number; width: number; top: number }) => void;
};

export default function WeeklyView({
  anchorDate, logMap, members, todayStr,
  onToggleDay, onCellHover,
}: WeeklyViewProps) {
  const dates = getWeekDates(anchorDate);

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_LABELS.map((label) => (
        <div key={label} className="text-center text-xs font-semibold text-on-surface/30 uppercase tracking-wider py-1">
          {label}
        </div>
      ))}
      {dates.map((date) => {
        const dateStr = toDateStr(date);
        const log = logMap.get(dateStr);
        const completedUserIds = log?.userIds ?? [];
        const completedCount = log?.completedBy ?? 0;
        const totalMembers = log?.totalMembers ?? members.length;
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;

        return (
          <button
            key={dateStr}
            onClick={() => onToggleDay(dateStr)}
            onMouseEnter={(e) => onCellHover(dateStr, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onCellHover(null)}
            disabled={isFuture}
            className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 min-h-[110px] border transition-all ${
              isFuture
                ? "border-gray-50 bg-gray-50 cursor-default"
                : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm cursor-pointer"
            } ${isToday ? "ring-2 ring-secondary ring-offset-1" : ""}`}
          >
            <span className={`text-sm font-bold ${
              isToday ? "text-secondary-dark" : "text-on-surface"
            }`}>
              {date.getDate()}
            </span>

            <div className="flex flex-wrap justify-center gap-0.5">
              {members.map((member) => {
                const completed = completedUserIds.includes(member.userId);
                return (
                  <span
                    key={member.userId}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold transition-colors ${
                      completed
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-300 border border-gray-200"
                    }`}
                    title={member.firstName ?? ""}
                  >
                    {getMemberInitials(member.firstName, member.lastName)}
                  </span>
                );
              })}
            </div>

            <span className={`text-xs font-semibold ${
              completedCount === 0 ? "text-on-surface/20" : "text-on-surface/50"
            }`}>
              {completedCount}/{totalMembers}
            </span>
          </button>
        );
      })}
    </div>
  );
}
