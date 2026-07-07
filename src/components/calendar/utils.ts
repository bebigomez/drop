export type LogEntry = {
  date: string;
  completedBy: number;
  totalMembers: number;
  userIds: string[];
};

export type MemberInfo = {
  userId: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
};

export type CalendarView = "daily" | "weekly" | "monthly" | "yearly";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export function getWeekDates(date: Date): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const adjustedOffset = startDay === 0 ? 6 : startDay - 1;

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < adjustedOffset; i++) week.push(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

export function getYearWeeks(year: number): Date[][] {
  const start = getMonday(new Date(year, 0, 1));
  const end = new Date(year, 11, 31);
  const endDay = end.getDay();
  const endSunday = new Date(end);
  endSunday.setDate(endSunday.getDate() + (endDay === 0 ? 0 : 7 - endDay));

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  while (cursor <= endSunday) {
    weeks.push(getWeekDates(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

export function formatTooltip(dateStr: string, completedBy: number, totalMembers: number): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const dayName = dayNames[d.getDay()];
  const month = MONTH_NAMES[d.getMonth()];
  return `${dayName} ${d.getDate()} de ${month} · ${completedBy}/${totalMembers} miembros completaron`;
}

export function getMemberInitials(firstName?: string, lastName?: string): string {
  return ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() || "?";
}

export function getCellColor(ratio: number, isFuture: boolean): string {
  if (isFuture) return "bg-gray-100";
  if (ratio === 0) return "bg-gray-200";
  if (ratio < 0.5) return "bg-primary-light";
  if (ratio < 1) return "bg-primary";
  return "bg-primary-dark";
}

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export { MONTH_NAMES };
