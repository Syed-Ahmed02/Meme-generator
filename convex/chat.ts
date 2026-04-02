import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const addMessage = mutation({
  args: {
    draftId: v.id("meme_drafts"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    await ctx.db.insert("chat_messages", {
      userId: identity.subject,
      draftId: args.draftId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    })
  },
})

export const getMessagesForDraft = query({
  args: { draftId: v.id("meme_drafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("chat_messages")
      .withIndex("by_draft", (q) => q.eq("draftId", args.draftId))
      .order("asc")
      .collect()
  },
})
