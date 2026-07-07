import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    frequency: v.string(),
    inviteCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_creator", ["createdBy"]),

  habitMembers: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    status: v.string(),
    invitedBy: v.string(),
    joinedAt: v.optional(v.number()),
  })
    .index("by_habit", ["habitId"])
    .index("by_user", ["userId"])
    .index("by_habit_user", ["habitId", "userId"]),

  habitLogs: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    date: v.string(),
    completed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_habit_date", ["habitId", "date"])
    .index("by_habit_user_date", ["habitId", "userId", "date"])
    .index("by_user_habit_date", ["userId", "habitId", "date"]),

  achievements: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    type: v.string(),
    unlockedAt: v.number(),
  })
    .index("by_habit_user", ["habitId", "userId"])
    .index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    habitId: v.id("habits"),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
