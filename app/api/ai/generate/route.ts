import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
  })

  const result = streamText({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    system: `You are a meme text generator. Given a meme template name and a topic or joke from the user, respond ONLY with a JSON object in this exact format:
{"topText":"...","bottomText":"..."}
Keep each field under 60 characters. Be funny and relevant to both the meme format and the user's topic. Do not include any other text, markdown, or explanation — only the raw JSON object.`,
    messages,
  })

  return result.toDataStreamResponse()
}
