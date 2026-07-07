import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";

export async function createNotification(
  ctx: GenericMutationCtx<DataModel>,
  args: {
    userId: string;
    type: string;
    habitId: Id<"habits">;
    message: string;
  },
) {
  await ctx.db.insert("notifications", {
    userId: args.userId,
    type: args.type,
    habitId: args.habitId,
    message: args.message,
    read: false,
    createdAt: Date.now(),
  });
}
