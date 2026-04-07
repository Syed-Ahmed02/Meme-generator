import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { paginationOptsValidator } from "convex/server"

export const upsertMemeTemplates = mutation({
  args: {
    templates: v.array(
      v.object({
        tenorId: v.string(),
        name: v.string(),
        url: v.string(),
        previewUrl: v.string(),
        width: v.number(),
        height: v.number(),
        tags: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    for (const template of args.templates) {
      const existing = await ctx.db
        .query("meme_templates")
        .withIndex("by_tenor_id", (q) => q.eq("tenorId", template.tenorId))
        .unique()

      if (!existing) {
        await ctx.db.insert("meme_templates", {
          ...template,
          fetchedAt: now,
        })
      }
    }
  },
})

export const listTemplates = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meme_templates")
      .withIndex("by_fetched_at")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getTemplateByTenorId = query({
  args: { tenorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meme_templates")
      .withIndex("by_tenor_id", (q) => q.eq("tenorId", args.tenorId))
      .unique()
  },
})
