import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { createNotification } from "./notifications";

export async function checkAndAwardAchievements(
  ctx: GenericMutationCtx<DataModel>,
  habitId: Id<"habits">,
  userId: string,
) {
  const existingAchievements = await ctx.db
    .query("achievements")
    .withIndex("by_habit_user", (q) =>
      q.eq("habitId", habitId).eq("userId", userId),
    )
    .collect();

  const existingTypes = new Set(existingAchievements.map((a) => a.type));

  const logs = await ctx.db
    .query("habitLogs")
    .withIndex("by_habit_user_date", (q) =>
      q.eq("habitId", habitId).eq("userId", userId),
    )
    .filter((q) => q.eq(q.field("completed"), true))
    .collect();

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const personalStreak = calculateStreak(sorted, today);

  if (!existingTypes.has("first_log") && logs.length >= 1) {
    await ctx.db.insert("achievements", {
      habitId,
      userId,
      type: "first_log",
      unlockedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId,
      type: "achievement_unlocked",
      habitId,
      message: "Logro desbloqueado: primer día completado",
    });
  }

  const streakThresholds = [
    { type: "streak_3", threshold: 3 },
    { type: "streak_7", threshold: 7 },
    { type: "streak_14", threshold: 14 },
    { type: "streak_30", threshold: 30 },
  ] as const;

  for (const { type, threshold } of streakThresholds) {
    if (!existingTypes.has(type) && personalStreak >= threshold) {
      await ctx.db.insert("achievements", {
        habitId,
        userId,
        type,
        unlockedAt: Date.now(),
      });

      await createNotification(ctx, {
        userId,
        type: "achievement_unlocked",
        habitId,
        message: `Logro desbloqueado: racha de ${threshold} días`,
      });
    }
  }

  if (!existingTypes.has("perfect_week") && personalStreak >= 7) {
    await ctx.db.insert("achievements", {
      habitId,
      userId,
      type: "perfect_week",
      unlockedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId,
      type: "achievement_unlocked",
      habitId,
      message: "Logro desbloqueado: semana perfecta",
    });
  }

  const logsByDate = await ctx.db
    .query("habitLogs")
    .withIndex("by_habit_date", (q) => q.eq("habitId", habitId))
    .collect();

  const members = await ctx.db
    .query("habitMembers")
    .withIndex("by_habit", (q) => q.eq("habitId", habitId))
    .filter((q) => q.eq(q.field("status"), "accepted"))
    .collect();

  const totalMembers = members.length;

  const groupLogMap = new Map<string, string[]>();
  for (const log of logsByDate) {
    if (!log.completed) continue;
    const ids = groupLogMap.get(log.date) ?? [];
    ids.push(log.userId);
    groupLogMap.set(log.date, ids);
  }

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 1);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 34);

  const allDays: { date: string; completedBy: number }[] = [];
  const cursor = new Date(startDate);
  while (cursor < endDate) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const ids = groupLogMap.get(dateStr) ?? [];
    allDays.push({ date: dateStr, completedBy: ids.length });
    cursor.setDate(cursor.getDate() + 1);
  }

  const groupStreak = calculateGroupStreak(allDays, totalMembers);

  if (!existingTypes.has("group_streak_3") && groupStreak >= 3) {
    await ctx.db.insert("achievements", {
      habitId,
      userId,
      type: "group_streak_3",
      unlockedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId,
      type: "achievement_unlocked",
      habitId,
      message: "Logro desbloqueado: racha grupal de 3 días",
    });
  }

  if (!existingTypes.has("group_streak_7") && groupStreak >= 7) {
    await ctx.db.insert("achievements", {
      habitId,
      userId,
      type: "group_streak_7",
      unlockedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId,
      type: "achievement_unlocked",
      habitId,
      message: "Logro desbloqueado: racha grupal de 7 días",
    });
  }

  if (!existingTypes.has("group_perfect_week") && groupStreak >= 7) {
    await ctx.db.insert("achievements", {
      habitId,
      userId,
      type: "group_perfect_week",
      unlockedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId,
      type: "achievement_unlocked",
      habitId,
      message: "Logro desbloqueado: semana grupal perfecta",
    });
  }
}

function calculateStreak(
  sortedLogs: { date: string }[],
  today: string,
): number {
  let streak = 0;
  const d = new Date(today);
  const logDates = new Set(sortedLogs.map((l) => l.date));

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    if (logDates.has(dateStr)) {
      streak++;
    } else if (dateStr === today) {
      return 0;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

function calculateGroupStreak(
  days: { date: string; completedBy: number }[],
  totalMembers: number,
): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const day of sorted) {
    if (day.completedBy === totalMembers) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
