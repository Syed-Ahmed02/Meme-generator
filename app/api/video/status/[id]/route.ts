import Replicate from "replicate"
import type { VideoJob } from "@/lib/types"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  })

  try {
    const prediction = await replicate.predictions.get(id)

    const job: VideoJob = {
      id: prediction.id,
      status: prediction.status as VideoJob["status"],
      outputUrl:
        prediction.output && Array.isArray(prediction.output)
          ? (prediction.output[0] as string)
          : typeof prediction.output === "string"
            ? prediction.output
            : undefined,
    }

    return Response.json(job)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
