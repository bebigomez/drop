import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./auth";
import { checkAndAwardAchievements } from "./achievements";
import { createNotification } from "./notifications";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createHabit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("habits"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    let inviteCode: string;
    let existing: Doc<"habits"> | null;

    do {
      inviteCode = generateInviteCode();
      existing = await ctx.db
        .query("habits")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .first();
    } while (existing);

    const habitId = await ctx.db.insert("habits", {
      name: args.name,
      description: args.description,
      createdBy: userId,
      frequency: "daily",
      inviteCode,
      createdAt: Date.now(),
    });

    await ctx.db.insert("habitMembers", {
      habitId,
      userId,
      status: "accepted",
      invitedBy: userId,
      joinedAt: Date.now(),
    });

    return habitId;
  },
});

export const toggleLog = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
  },
  returns: v.object({ completed: v.boolean() }),
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

    const today = new Date().toISOString().slice(0, 10);
    if (args.date > today) {
      throw new ConvexError("No puedes marcar días futuros");
    }

    const existing = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit_user_date", (q) =>
        q
          .eq("habitId", args.habitId)
          .eq("userId", userId)
          .eq("date", args.date),
      )
      .first();

    let completed: boolean;

    if (existing) {
      completed = !existing.completed;
      await ctx.db.patch(existing._id, {
        completed,
        updatedAt: Date.now(),
      });
    } else {
      completed = true;
      await ctx.db.insert("habitLogs", {
        habitId: args.habitId,
        userId,
        date: args.date,
        completed,
        updatedAt: Date.now(),
      });
    }

    await checkAndAwardAchievements(ctx, args.habitId, userId);

    return { completed };
  },
});

export const regenerateInviteCode = mutation({
  args: {
    habitId: v.id("habits"),
  },
  returns: v.object({ inviteCode: v.string() }),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new ConvexError("Hábito no encontrado");
    if (habit.createdBy !== userId) {
      throw new ConvexError("Solo el creador puede regenerar el código");
    }

    let inviteCode: string;
    let existing: Doc<"habits"> | null;

    do {
      inviteCode = generateInviteCode();
      existing = await ctx.db
        .query("habits")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .first();
    } while (existing);

    await ctx.db.patch(args.habitId, { inviteCode });

    return { inviteCode };
  },
});

export const joinViaLink = mutation({
  args: {
    inviteCode: v.string(),
  },
  returns: v.object({ habitId: v.id("habits") }),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const habit = await ctx.db
      .query("habits")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!habit) throw new ConvexError("Código inválido");

    const existing = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit_user", (q) =>
        q.eq("habitId", habit._id).eq("userId", userId),
      )
      .first();

    if (existing) throw new ConvexError("Ya eres miembro de este hábito");

    await ctx.db.insert("habitMembers", {
      habitId: habit._id,
      userId,
      status: "accepted",
      invitedBy: habit.createdBy,
      joinedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId: habit.createdBy,
      type: "member_joined",
      habitId: habit._id,
      message: "Un nuevo miembro se unió al hábito",
    });

    const memberCount = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect()
      .then((m) => m.length);

    if (memberCount === 2) {
      const existingAchievement = await ctx.db
        .query("achievements")
        .withIndex("by_habit_user", (q) =>
          q.eq("habitId", habit._id).eq("userId", habit.createdBy),
        )
        .filter((q) => q.eq(q.field("type"), "first_member"))
        .first();

      if (!existingAchievement) {
        await ctx.db.insert("achievements", {
          habitId: habit._id,
          userId: habit.createdBy,
          type: "first_member",
          unlockedAt: Date.now(),
        });

        await createNotification(ctx, {
          userId: habit.createdBy,
          type: "achievement_unlocked",
          habitId: habit._id,
          message: "Logro desbloqueado: primer miembro en unirse",
        });
      }
    }

    return { habitId: habit._id };
  },
});

export const leaveHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new ConvexError("Hábito no encontrado");

    const membership = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit_user", (q) =>
        q.eq("habitId", args.habitId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new ConvexError("No eres miembro de este hábito");

    if (habit.createdBy === userId) {
      const otherMembers = await ctx.db
        .query("habitMembers")
        .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
        .filter((q) => q.neq(q.field("userId"), userId))
        .collect();

      if (otherMembers.length > 0) {
        throw new ConvexError(
          "Debes transferir o eliminar el hábito antes de irte",
        );
      }

      await ctx.db.delete(args.habitId);
      await ctx.db.delete(membership._id);
      return;
    }

    await ctx.db.delete(membership._id);

    await createNotification(ctx, {
      userId: habit.createdBy,
      type: "member_left",
      habitId: args.habitId,
      message: "Un miembro abandonó el hábito",
    });
  },
});

export const removeMember = mutation({
  args: {
    habitId: v.id("habits"),
    memberUserId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new ConvexError("Hábito no encontrado");
    if (habit.createdBy !== userId) {
      throw new ConvexError("Solo el creador puede expulsar miembros");
    }
    if (args.memberUserId === userId) {
      throw new ConvexError("No puedes expulsarte a ti mismo");
    }

    const membership = await ctx.db
      .query("habitMembers")
      .withIndex("by_habit_user", (q) =>
        q.eq("habitId", args.habitId).eq("userId", args.memberUserId),
      )
      .first();

    if (!membership) throw new ConvexError("Miembro no encontrado");

    await ctx.db.delete(membership._id);
  },
});

export const markNotificationsRead = mutation({
  args: {
    notificationIds: v.array(v.id("notifications")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    for (const id of args.notificationIds) {
      const notification = await ctx.db.get(id);
      if (notification && notification.userId === userId) {
        await ctx.db.patch(id, { read: true });
      }
    }
  },
});
