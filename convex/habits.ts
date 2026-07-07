import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUserOrThrow, authComponent } from "./auth";

const DAYS_LOOKBACK = 34;

export const getUserHabits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const memberships = await ctx.db
      .query("habitMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const habits = await Promise.all(
      memberships.map(async (membership) => {
        const habit = await ctx.db.get(membership.habitId);
        if (!habit) return null;

        const members = await ctx.db
          .query("habitMembers")
          .withIndex("by_habit", (q) => q.eq("habitId", membership.habitId))
          .filter((q) => q.eq(q.field("status"), "accepted"))
          .collect();

        const today = new Date().toISOString().slice(0, 10);
        const pastDate = getPastDate(DAYS_LOOKBACK, today);

        const personalLogs = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit_user_date", (q) =>
            q.eq("habitId", membership.habitId).eq("userId", userId),
          )
          .filter((q) => q.gte(q.field("date"), pastDate))
          .collect();

        return {
          _id: habit._id,
          _creationTime: habit._creationTime,
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          createdAt: habit.createdAt,
          memberCount: members.length,
          personalStreak: calculatePersonalStreak(personalLogs, today),
        };
      }),
    );

    return habits.filter((h): h is NonNullable<typeof h> => h !== null);
  },
});

export const getHabitDetails = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const membership = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit_user", (q) =>
        q.eq("habitId", args.habitId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.status !== "accepted") {
      throw new ConvexError("No eres miembro de este hábito");
    }

    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new ConvexError("Hábito no encontrado");

    const members = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        const user = await authComponent.getAnyUserById(ctx, member.userId);
        const userData = user as any;
        return {
          ...member,
          name: user?.name ?? member.userId,
          firstName: userData?.firstName ?? user?.name?.split(" ")[0] ?? member.userId,
          lastName: userData?.lastName ?? user?.name?.split(" ").slice(1).join(" ") ?? "",
          image: user?.image ?? null,
        };
      }),
    );

    const today = new Date().toISOString().slice(0, 10);
    const startDate = getPastDate(DAYS_LOOKBACK, today);

    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.gte(q.field("date"), startDate))
      .collect();

    const logMap = new Map<string, string[]>();
    for (const log of logs) {
      if (!log.completed) continue;
      const ids = logMap.get(log.date) ?? [];
      ids.push(log.userId);
      logMap.set(log.date, ids);
    }

    const memberUserIds = membersWithProfiles.map((m) => m.userId);

    const logsByDate: {
      date: string;
      completedBy: number;
      totalMembers: number;
      userIds: string[];
    }[] = [];

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);
    const cursor = new Date(startDate);

    while (cursor < endDate) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const completedUserIds = logMap.get(dateStr) ?? [];
      logsByDate.push({
        date: dateStr,
        completedBy: completedUserIds.length,
        totalMembers: memberUserIds.length,
        userIds: completedUserIds,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const personalLogs = logs
      .filter((l) => l.userId === userId)
      .map((l) => ({ date: l.date, completed: l.completed }));

    const groupStreak = calculateGroupStreak(logsByDate, memberUserIds.length);
    const personalStreak = calculatePersonalStreak(personalLogs, today);

    return {
      habit,
      members: membersWithProfiles,
      logs: logsByDate,
      personalLogs,
      groupStreak,
      personalStreak,
    };
  },
});

export const getUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);

    return ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("read", false),
      )
      .order("desc")
      .collect();
  },
});

function getPastDate(daysAgo: number, fromDate: string): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function calculatePersonalStreak(
  logs: { date: string; completed: boolean }[],
  today: string,
): number {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const d = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    const log = sorted.find((l) => l.date === dateStr);

    if (log && log.completed) {
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
  logsByDate: { date: string; completedBy: number; totalMembers: number }[],
  totalMembers: number,
): number {
  const sorted = [...logsByDate].sort((a, b) => b.date.localeCompare(a.date));
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
