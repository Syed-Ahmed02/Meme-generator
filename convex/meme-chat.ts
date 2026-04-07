import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createSession = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    const now = Date.now()
    return await ctx.db.insert("meme_chat_sessions", {
      userId: identity.subject,
      title: args.title,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const touchSession = mutation({
  args: { sessionId: v.id("meme_chat_sessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    await ctx.db.patch(args.sessionId, { updatedAt: Date.now() })
  },
})

export const addMessage = mutation({
  args: {
    sessionId: v.id("meme_chat_sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    imageDescription: v.optional(v.string()),
    memeResult: v.optional(
      v.object({
        templateId: v.string(),
        templateName: v.string(),
        templateUrl: v.string(),
        templateWidth: v.number(),
        templateHeight: v.number(),
        topText: v.string(),
        bottomText: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    await ctx.db.insert("meme_chat_messages", {
      sessionId: args.sessionId,
      userId: identity.subject,
      role: args.role,
      content: args.content,
      imageDescription: args.imageDescription,
      memeResult: args.memeResult,
      createdAt: Date.now(),
    })
  },
})

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("meme_chat_sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
  },
})

export const getMessages = query({
  args: { sessionId: v.id("meme_chat_sessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("meme_chat_messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect()
  },
})
