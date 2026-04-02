import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { layerValidator } from "./schema"

export const upsertDraft = mutation({
  args: {
    templateId: v.string(),
    templateName: v.string(),
    layers: v.array(layerValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    const userId = identity.subject

    const existing = await ctx.db
      .query("meme_drafts")
      .withIndex("by_user_template", (q) =>
        q.eq("userId", userId).eq("templateId", args.templateId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        layers: args.layers,
        updatedAt: Date.now(),
      })
      return existing._id
    } else {
      return await ctx.db.insert("meme_drafts", {
        userId,
        templateId: args.templateId,
        templateName: args.templateName,
        layers: args.layers,
        updatedAt: Date.now(),
      })
    }
  },
})

export const getDraft = query({
  args: { templateId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const userId = identity.subject

    return await ctx.db
      .query("meme_drafts")
      .withIndex("by_user_template", (q) =>
        q.eq("userId", userId).eq("templateId", args.templateId)
      )
      .unique()
  },
})

export const listDrafts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("meme_drafts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
  },
})
