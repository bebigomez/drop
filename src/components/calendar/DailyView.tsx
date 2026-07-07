import type { LogEntry, MemberInfo } from "./utils";
import { getMemberInitials } from "./utils";

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

type DailyViewProps = {
  anchorDate: Date;
  logMap: Map<string, LogEntry>;
  members: MemberInfo[];
  currentUserId: string;
  todayStr: string;
  onToggleDay: (dateStr: string) => Promise<void>;
};

export default function DailyView({ anchorDate, logMap, members, currentUserId, todayStr, onToggleDay }: DailyViewProps) {
  const dateStr = anchorDate.toISOString().slice(0, 10);
  const log = logMap.get(dateStr);
  const completedUserIds = log?.userIds ?? [];
  const isFuture = dateStr > todayStr;
  const isToday = dateStr === todayStr;
  const completedCount = log?.completedBy ?? 0;
  const totalMembers = log?.totalMembers ?? members.length;

  const dayName = DAY_NAMES[anchorDate.getDay()];
  const monthName = MONTH_NAMES[anchorDate.getMonth()];

  return (
    <div className="min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <p className="text-lg font-bold text-on-surface capitalize">
            {dayName}, {anchorDate.getDate()} de {monthName}
          </p>
          {isToday && (
            <span className="text-xs font-semibold text-secondary-dark bg-secondary/10 px-2 py-0.5 rounded-full">
              Hoy
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-on-surface">{completedCount}/{totalMembers}</p>
          <p className="text-xs text-on-surface/40">completaron</p>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0}%` }}
        />
      </div>

      <ul className="space-y-2">
        {members.map((member) => {
          const completed = completedUserIds.includes(member.userId);
          const isSelf = member.userId === currentUserId;

          return (
            <li
              key={member.userId}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  completed
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-300"
                }`}>
                  {getMemberInitials(member.firstName, member.lastName)}
                </span>
              )}

              <span className="flex-1 text-sm font-medium text-on-surface truncate">
                {isSelf ? "Tú" : `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Miembro"}
                {isSelf && (
                  <span className="ml-2 text-xs text-on-surface/30 font-normal">(tú)</span>
                )}
              </span>

              {isSelf && isToday && !isFuture ? (
                <button
                  onClick={() => onToggleDay(dateStr)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    completed
                      ? "bg-error/10 text-error hover:bg-error/20"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {completed ? "Desmarcar" : "Completar"}
                </button>
              ) : (
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                  completed ? "text-success" : "text-gray-300"
                }`}>
                  {completed ? "Completado" : "Pendiente"}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    completed ? "bg-success/10" : "bg-gray-100"
                  }`}>
                    {completed ? (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
