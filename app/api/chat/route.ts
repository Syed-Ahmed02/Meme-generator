import { auth } from "@clerk/nextjs/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { FALLBACK_MEMES } from "@/lib/memes-fallback"
import type { MemeTemplate } from "@/lib/types"

const MemeSelectionSchema = z.object({
  replyText: z.string().describe("A short, fun conversational reply (1–2 sentences)"),
  templateId: z.string().describe("The imgflip template ID that best fits the context"),
  templateName: z.string().describe("Human-readable name of the chosen template"),
  topText: z.string().max(80).describe("Top caption text, punchy and under 80 chars"),
  bottomText: z.string().max(80).describe("Bottom caption text, punchline, under 80 chars"),
})

async function fetchTemplates(): Promise<MemeTemplate[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/memes`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return data.memes as MemeTemplate[]
  } catch {
    return FALLBACK_MEMES
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const userMessage = (body.userMessage as string | undefined)?.trim() ?? ""
  const imageDescription = (body.imageDescription as string | undefined) ?? ""
  const conversationHistory = (body.conversationHistory as Array<{ role: string; content: string }> | undefined) ?? []

  if (!userMessage) {
    return Response.json({ error: "userMessage is required" }, { status: 400 })
  }

  const templates = await fetchTemplates()
  const top100 = templates.slice(0, 100)
  const templateList = top100.map((t) => `${t.id}: ${t.name}`).join("\n")

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
  })

  const historyContext =
    conversationHistory.length > 0
      ? "\n\nPrevious conversation:\n" +
        conversationHistory
          .slice(-6)
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n")
      : ""

  const userContent = imageDescription
    ? `The user shared an image: ${imageDescription}\n\nUser message: ${userMessage}`
    : userMessage

  try {
    const { object } = await generateObject({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      schema: MemeSelectionSchema,
      system: `You are a meme expert. Given a user's message, pick the most fitting meme template from the list below and write hilarious captions.

Available meme templates (id: name):
${templateList}

Rules:
- Pick exactly one templateId from the list above
- Keep topText and bottomText under 80 chars each
- Be funny, relevant, and capture the meme's typical format
- replyText should be 1-2 sentences of witty commentary${historyContext}`,
      prompt: userContent,
    })

    const template = top100.find((t) => t.id === object.templateId)

    if (!template) {
      return Response.json({ error: "Template not found" }, { status: 500 })
    }

    return Response.json({
      replyText: object.replyText,
      memeResult: {
        templateId: template.id,
        templateName: template.name,
        templateUrl: template.url,
        templateWidth: template.width,
        templateHeight: template.height,
        topText: object.topText,
        bottomText: object.bottomText,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
