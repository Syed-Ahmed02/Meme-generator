import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const layerValidator = v.object({
  id: v.string(),
  text: v.string(),
  x: v.number(),
  y: v.number(),
  width: v.number(),
  fontSize: v.number(),
  fontFamily: v.string(),
  fontStyle: v.string(),
  fill: v.string(),
  stroke: v.string(),
  strokeWidth: v.number(),
  align: v.string(),
})

export default defineSchema({
  meme_drafts: defineTable({
    userId: v.string(),
    templateId: v.string(),
    templateName: v.string(),
    layers: v.array(layerValidator),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_template", ["userId", "templateId"]),

  chat_messages: defineTable({
    userId: v.string(),
    draftId: v.id("meme_drafts"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_draft", ["draftId"]),

  video_history: defineTable({
    userId: v.string(),
    templateId: v.string(),
    templateName: v.string(),
    predictionId: v.string(),
    outputUrl: v.optional(v.string()),
    prompt: v.string(),
    status: v.union(
      v.literal("starting"),
      v.literal("processing"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prediction", ["predictionId"]),
})
