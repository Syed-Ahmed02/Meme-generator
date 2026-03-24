import Replicate from "replicate"

export async function POST(req: Request) {
  const { imageDataUrl } = await req.json()

  if (!imageDataUrl) {
    return Response.json({ error: "imageDataUrl is required" }, { status: 400 })
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  })

  try {
    const prediction = await replicate.predictions.create({
      model: "stability-ai/stable-video-diffusion",
      input: {
        input_image: imageDataUrl,
        video_length: "14_frames_with_svd",
        sizing_strategy: "maintain_aspect_ratio",
        frames_per_second: 6,
        motion_bucket_id: 127,
        cond_aug: 0.02,
      },
    })

    return Response.json({ predictionId: prediction.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
