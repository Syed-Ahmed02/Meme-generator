import Replicate from "replicate"

const DEFAULT_PROMPT =
  "Subtle motion and parallax, keep the meme text sharp and readable, short playful energy"

export async function POST(req: Request) {
  const body = await req.json()
  const imageDataUrl = body.imageDataUrl as string | undefined
  const prompt = (body.prompt as string | undefined)?.trim() || DEFAULT_PROMPT
  const resolution = (body.resolution as string | undefined) || "768p"
  const durationRaw = body.duration
  const duration =
    typeof durationRaw === "number" && Number.isFinite(durationRaw)
      ? Math.round(durationRaw)
      : 6
  const promptOptimizer =
    typeof body.promptOptimizer === "boolean" ? body.promptOptimizer : true

  if (!imageDataUrl) {
    return Response.json({ error: "imageDataUrl is required" }, { status: 400 })
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  })

  const input = {
    prompt,
    duration,
    resolution,
    prompt_optimizer: promptOptimizer,
    first_frame_image: imageDataUrl,
  }

  try {
    const prediction = await replicate.predictions.create({
      model: "minimax/hailuo-2.3",
      input,
    })

    return Response.json({ predictionId: prediction.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
