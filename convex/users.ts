import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent, getCurrentUserOrThrow, createAuth } from "./auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfilePhoto = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);

    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata) throw new ConvexError("Archivo no encontrado");

    const MAX_SIZE = 1024 * 1024;
    const size = metadata.size ?? 0;
    if (size > MAX_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError("La imagen no puede superar 1MB");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new ConvexError("Error al obtener la URL de la imagen");

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.updateUser({
      body: { image: imageUrl },
      headers,
    });

    return imageUrl;
  },
});
