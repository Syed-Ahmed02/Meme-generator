import { FALLBACK_MEMES } from "@/lib/memes-fallback"
import type { MemeTemplate } from "@/lib/types"

export async function GET() {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("Imgflip API error")

    const data = await res.json()
    const memes: MemeTemplate[] = data.data.memes.map((m: {
      id: string
      name: string
      url: string
      width: number
      height: number
      box_count: number
    }) => ({
      id: m.id,
      name: m.name,
      url: m.url,
      width: m.width,
      height: m.height,
      boxCount: m.box_count,
    }))

    return Response.json(
      { memes },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    )
  } catch {
    return Response.json(
      { memes: FALLBACK_MEMES },
      { headers: { "Cache-Control": "public, max-age=300" } }
    )
  }
}
