import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!convexUrl) {
    return Response.json({ meme: null }, { status: 500 })
  }

  try {
    const convex = new ConvexHttpClient(convexUrl)
    const meme = await convex.query(api.templates.getTemplateByTenorId, {
      tenorId: id,
    })

    if (!meme) {
      return Response.json({ meme: null }, { status: 404 })
    }

    return Response.json({
      meme: {
        id: meme.tenorId,
        name: meme.name,
        url: meme.url,
        previewUrl: meme.previewUrl,
        width: meme.width,
        height: meme.height,
        boxCount: 2,
        tags: meme.tags,
      },
    })
  } catch (err) {
    console.error("Template lookup failed:", err)
    return Response.json({ meme: null }, { status: 500 })
  }
}
