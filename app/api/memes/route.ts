import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { MemeTemplate } from "@/lib/types"

interface TenorMediaFormat {
  url: string
  dims: [number, number]
  size: number
}

interface TenorResult {
  id: string
  title: string
  content_description: string
  media_formats: {
    gif?: TenorMediaFormat
    tinygif?: TenorMediaFormat
    mp4?: TenorMediaFormat
  }
  tags: string[]
}

interface TenorResponse {
  results: TenorResult[]
  next: string
}

function mapTenorResult(result: TenorResult): MemeTemplate & {
  previewUrl: string
  tags: string[]
} {
  const gif = result.media_formats.gif
  const tinygif = result.media_formats.tinygif

  const url = gif?.url ?? tinygif?.url ?? ""
  const previewUrl = tinygif?.url ?? gif?.url ?? ""
  const dims = gif?.dims ?? tinygif?.dims ?? [480, 480]

  return {
    id: result.id,
    name: result.content_description || result.title || "Untitled",
    url,
    previewUrl,
    width: dims[0],
    height: dims[1],
    boxCount: 2,
    tags: result.tags ?? [],
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor") ?? ""
  const q = searchParams.get("q") ?? ""

  const apiKey = process.env.TENOR_API_KEY
  if (!apiKey) {
    return Response.json({ memes: [], nextCursor: "" }, { status: 200 })
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      limit: "20",
      media_filter: "gif",
      contentfilter: "medium",
    })
    if (cursor) params.set("pos", cursor)

    let tenorUrl: string
    if (q.trim()) {
      params.set("q", q.trim())
      tenorUrl = `https://tenor.googleapis.com/v2/search?${params}`
    } else {
      tenorUrl = `https://tenor.googleapis.com/v2/featured?${params}`
    }

    const res = await fetch(tenorUrl)
    if (!res.ok) throw new Error(`Tenor API error: ${res.status}`)

    const data: TenorResponse = await res.json()
    const memes = data.results.map(mapTenorResult)

    // Cache new templates in Convex
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (convexUrl && memes.length > 0) {
      const convex = new ConvexHttpClient(convexUrl)
      await convex.mutation(api.templates.upsertMemeTemplates, {
        templates: memes.map((m) => ({
          tenorId: m.id,
          name: m.name,
          url: m.url,
          previewUrl: m.previewUrl,
          width: m.width,
          height: m.height,
          tags: m.tags,
        })),
      })
    }

    return Response.json({ memes, nextCursor: data.next ?? "" })
  } catch (err) {
    console.error("Tenor API fetch failed:", err)
    return Response.json({ memes: [], nextCursor: "" })
  }
}
