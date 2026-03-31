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

    const raw = prediction.output
    let outputUrl: string | undefined
    if (raw == null) {
      outputUrl = undefined
    } else if (Array.isArray(raw)) {
      outputUrl = raw[0] as string
    } else if (typeof raw === "string") {
      outputUrl = raw
    } else if (typeof raw === "object" && raw !== null && "url" in raw) {
      const u = (raw as { url?: unknown }).url
      outputUrl = typeof u === "string" ? u : undefined
    }

    const errRaw = prediction.error
    const errorMessage =
      errRaw != null && errRaw !== ""
        ? typeof errRaw === "string"
          ? errRaw
          : JSON.stringify(errRaw)
        : undefined

    const job: VideoJob = {
      id: prediction.id,
      status: prediction.status as VideoJob["status"],
      outputUrl,
      errorMessage,
    }

    return Response.json(job)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
