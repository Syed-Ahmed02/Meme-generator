import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const statusValidator = v.union(
  v.literal("starting"),
  v.literal("processing"),
  v.literal("succeeded"),
  v.literal("failed")
)

export const saveVideo = mutation({
  args: {
    templateId: v.string(),
    templateName: v.string(),
    predictionId: v.string(),
    prompt: v.string(),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    return await ctx.db.insert("video_history", {
      userId: identity.subject,
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const updateVideoStatus = mutation({
  args: {
    predictionId: v.string(),
    status: statusValidator,
    outputUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    const row = await ctx.db
      .query("video_history")
      .withIndex("by_prediction", (q) => q.eq("predictionId", args.predictionId))
      .unique()
    if (!row) return
    await ctx.db.patch(row._id, {
      status: args.status,
      outputUrl: args.outputUrl,
      errorMessage: args.errorMessage,
    })
  },
})

export const listVideos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("video_history")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
  },
})
